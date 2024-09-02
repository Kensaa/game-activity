// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use active_win_pos_rs;
use dirs;
use lazy_static::lazy_static;
use resolution;
use std::{collections::HashMap, env, fs, path::PathBuf};

type TimeRecord = HashMap<String, u64>;

lazy_static! {
    pub static ref FOLDER: PathBuf = match env::consts::OS {
        "windows" => {
            dirs::home_dir()
                .unwrap()
                .join("AppData")
                .join("Roaming")
                .join("game-activity")
        }
        "linux" => {
            dirs::home_dir()
                .unwrap()
                .join(".config")
                .join("game-activity")
        }
        _ => {
            panic!("Unsupported OS");
        }
    };
    pub static ref RESOLUTION: (i32, i32) =
        resolution::current_resolution().expect("failed to get resolution");
}

#[tauri::command]
fn get_data() -> HashMap<String, TimeRecord> {
    let mut data: HashMap<String, TimeRecord> = HashMap::new();
    for filepath in fs::read_dir((*FOLDER).clone()).expect("failed to read folder") {
        let filepath = filepath.expect("failed to get file path").path();
        let mut filename = filepath.file_name().unwrap().to_str().unwrap().to_string();
        filename.truncate(filename.len() - 5);
        let content = fs::read_to_string(filepath).expect("failed to read file");
        let time_record: TimeRecord = serde_json::from_str(&content).expect("failed to parse json");
        data.insert(filename, time_record);
    }

    return data;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    if !FOLDER.exists() {
        fs::create_dir_all(&*FOLDER).unwrap();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![get_data])
        .setup(|_| {
            tauri::async_runtime::spawn(async {
                loop {
                    update();
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
            });
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn update() {
    let active_window = active_win_pos_rs::get_active_window();

    let active_window = match active_window {
        Ok(active_window) => active_window,
        Err(_) => {
            println!("failed to get active window");
            return;
        }
    };

    // if app is not fullscreen, ignore
    let width = active_window.position.width as i32;
    let height = active_window.position.height as i32;
    if width != (*RESOLUTION).0 || height != (*RESOLUTION).1 {
        return;
    }

    let app_name = active_window.app_name;

    let date = chrono::Local::now().format("%d-%m-%Y").to_string();
    let file = FOLDER.join(date + ".json");

    let mut time_record: TimeRecord = if file.exists() {
        let content = fs::read_to_string(&file);
        let content = match content {
            Ok(content) => content,
            Err(_) => "{}".to_string(),
        };
        match serde_json::from_str(&content) {
            Ok(time_record) => time_record,
            Err(_) => HashMap::new(),
        }
    } else {
        HashMap::new()
    };

    if time_record.contains_key(&app_name) {
        let time = time_record.get_mut(&app_name).unwrap();
        *time += 1;
    } else {
        time_record.insert(app_name, 1);
    }

    let content = serde_json::to_string(&time_record).unwrap();

    fs::write(&file, content).expect("failed to write to file");
}
