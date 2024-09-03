// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use active_win_pos_rs;
use dirs;
use indexmap::IndexMap;
use lazy_static::lazy_static;
use resolution;
use std::{env, fs, path::PathBuf};
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder},
    tray::TrayIconBuilder,
    Manager,
};

type TimeRecord = IndexMap<String, u64>;

const MINIMUM_TIME: u64 = 60 * 5;

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
fn get_all_data() -> IndexMap<String, TimeRecord> {
    let mut data: IndexMap<String, TimeRecord> = IndexMap::new();
    for filepath in fs::read_dir((*FOLDER).clone()).expect("failed to read folder") {
        let filepath = filepath.expect("failed to get file path").path();
        let filename = filepath.file_name().unwrap().to_str().unwrap().to_string();

        let time_record = load_time_record(&filepath);
        data.insert(filename, time_record);
    }

    return data;
}

#[tauri::command]
fn get_daterange_data(start: &str, end: &str) -> IndexMap<String, TimeRecord> {
    let mut data: IndexMap<String, TimeRecord> = IndexMap::new();
    let start = chrono::NaiveDate::parse_from_str(start, "%d-%m-%Y").unwrap();
    let end = chrono::NaiveDate::parse_from_str(end, "%d-%m-%Y").unwrap();

    for filepath in fs::read_dir((*FOLDER).clone()).expect("failed to read folder") {
        let filepath = filepath.expect("failed to get file path").path();
        let mut filename = filepath.file_name().unwrap().to_str().unwrap().to_string();
        filename.truncate(filename.len() - 5);
        let date = chrono::NaiveDate::parse_from_str(&filename, "%d-%m-%Y").unwrap();
        if date >= start && date <= end {
            let filename = filename.to_string();
            let time_record = load_time_record(&filepath);
            data.insert(filename, time_record);
        }
    }

    return data;
}

#[tauri::command]
fn get_date_data(date: &str) -> TimeRecord {
    let date = chrono::NaiveDate::parse_from_str(date, "%d-%m-%Y").unwrap();
    let file = FOLDER.join(date.format("%d-%m-%Y").to_string() + ".json");
    let time_record = load_time_record(&file);
    return time_record;
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // create systray

    if !FOLDER.exists() {
        fs::create_dir_all(&*FOLDER).unwrap();
    }

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            get_all_data,
            get_date_data,
            get_daterange_data
        ])
        .setup(|app| {
            let quit = MenuItemBuilder::with_id("quit", "Quit").build(app)?;
            let show = MenuItemBuilder::with_id("show", "Show").build(app)?;

            let menu = MenuBuilder::new(app).items(&[&show, &quit]).build()?;
            let _ = TrayIconBuilder::new()
                .menu(&menu)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(move |app, event| match event.id().as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "show" => {
                        let app = app.app_handle();
                        if let Some(webview_window) = app.get_webview_window("main") {
                            webview_window.show().expect("failed to show window");
                            webview_window.set_focus().expect("failed to set focus");
                        }
                    }
                    _ => (),
                })
                .build(app)?;

            tauri::async_runtime::spawn(async {
                loop {
                    update();
                    std::thread::sleep(std::time::Duration::from_secs(1));
                }
            });
            Ok(())
        })
        .on_window_event(|app, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                api.prevent_close();
                // hide window
                let app = app.app_handle();
                if let Some(webview_window) = app.get_webview_window("main") {
                    webview_window.hide().expect("failed to hide window");
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn update() {
    let active_window = active_win_pos_rs::get_active_window();

    let active_window = match active_window {
        Ok(active_window) => active_window,
        Err(_) => return,
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

    let mut time_record = load_time_record(&file);

    if time_record.contains_key(&app_name) {
        let time = time_record.get_mut(&app_name).unwrap();
        *time += 1;
    } else {
        time_record.insert(app_name, 1);
    }

    let content = serde_json::to_string(&time_record).unwrap();

    fs::write(&file, content).expect("failed to write to file");
}

fn load_time_record(file: &PathBuf) -> TimeRecord {
    let content = fs::read_to_string(file);
    let content = match content {
        Ok(content) => content,
        Err(_) => "{}".to_string(),
    };
    let mut time_record: TimeRecord = match serde_json::from_str(&content) {
        Ok(time_record) => time_record,
        Err(_) => IndexMap::new(),
    };

    for (app_name, time) in time_record.clone().iter() {
        if *time < MINIMUM_TIME {
            time_record.swap_remove(app_name);
        }
    }

    return time_record;
}
