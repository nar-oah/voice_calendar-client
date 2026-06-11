use std::fs;
use std::path::Path;
use tauri::Manager;

const WHISPER_MODELS_DIR: &str = "whisper-models";

fn copy_bundled_whisper_models<R: tauri::Runtime>(
    app: &tauri::AppHandle<R>,
) -> Result<(), Box<dyn std::error::Error>> {
    let bundled_dir = app.path().resource_dir()?.join(WHISPER_MODELS_DIR);
    if !bundled_dir.exists() {
        return Ok(());
    }

    let models_dir = app.path().app_data_dir()?.join(WHISPER_MODELS_DIR);
    fs::create_dir_all(&models_dir)?;

    for entry in fs::read_dir(bundled_dir)? {
        let entry = entry?;
        let source = entry.path();
        if !source.is_file() || !is_whisper_resource(&source) {
            continue;
        }

        let target = models_dir.join(entry.file_name());
        if !target.exists() {
            fs::copy(source, target)?;
        }
    }

    Ok(())
}

fn is_whisper_resource(path: &Path) -> bool {
    path.file_name()
        .and_then(|name| name.to_str())
        .is_some_and(|name| name == "active.txt" || name.starts_with("ggml-") && name.ends_with(".bin"))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_stt::init())
        .setup(|app| {
            copy_bundled_whisper_models(app.handle())?;

            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
