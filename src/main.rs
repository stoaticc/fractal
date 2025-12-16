use axum::{
    routing::get,
    Router,
    response::{Html, Response},
    http::{StatusCode, header},
};
use std::net::SocketAddr;
use std::path::PathBuf;
use tokio::fs;
use tower_http::services::ServeDir;
use tao::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
    dpi::LogicalSize,
};
use wry::WebViewBuilder;

const INDEX_HTML: &str = include_str!("../source/index.html");

#[tokio::main]
async fn main() {
    // Start the web server in a background task
    tokio::spawn(async {
        run_server().await;
    });

    // Give the server a moment to start
    tokio::time::sleep(tokio::time::Duration::from_millis(500)).await;

    // Create and run the webview window
    let event_loop = EventLoop::new();
    let window = WindowBuilder::new()
        .with_title("FRACTAL")
        .with_inner_size(LogicalSize::new(800, 600))
        .build(&event_loop)
        .unwrap();

    let _webview = WebViewBuilder::new()
        .with_url("http://127.0.0.1:3030")
        .build(&window)
        .unwrap();

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                ..
            } => *control_flow = ControlFlow::Exit,
            _ => {}
        }
    });
}

async fn run_server() {
    // Get the executable directory
    let exe_path = std::env::current_exe().unwrap();
    let exe_dir = exe_path.parent().unwrap();
    let lib_path = exe_dir.join("lib");

    // Create router
    let app = Router::new()
        .route("/", get(serve_index))
        .nest_service("/classes", ServeDir::new(lib_path.join("classes")))
        .fallback(get(serve_static_files));

    // Run server
    let addr = SocketAddr::from(([127, 0, 0, 1], 3030));
    println!("Server running on http://{}", addr);
    
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn serve_index() -> Html<&'static str> {
    Html(INDEX_HTML)
}

async fn serve_static_files(uri: axum::http::Uri) -> Response {
    let exe_path = std::env::current_exe().unwrap();
    let exe_dir = exe_path.parent().unwrap();
    let lib_path = exe_dir.join("lib");
    
    // Remove leading slash from URI path
    let path = uri.path().trim_start_matches('/');
    let file_path = lib_path.join(path);

    match fs::read(&file_path).await {
        Ok(contents) => {
            let mime_type = get_mime_type(&file_path);
            Response::builder()
                .status(StatusCode::OK)
                .header(header::CONTENT_TYPE, mime_type)
                .body(contents.into())
                .unwrap()
        }
        Err(_) => Response::builder()
            .status(StatusCode::NOT_FOUND)
            .body("File not found".into())
            .unwrap(),
    }
}

fn get_mime_type(path: &PathBuf) -> &'static str {
    match path.extension().and_then(|s| s.to_str()) {
        Some("html") => "text/html",
        Some("css") => "text/css",
        Some("js") => "application/javascript",
        Some("json") => "application/json",
        Some("png") => "image/png",
        Some("jpg") | Some("jpeg") => "image/jpeg",
        Some("gif") => "image/gif",
        Some("svg") => "image/svg+xml",
        _ => "application/octet-stream",
    }
}
