use std::process::Command;

#[cfg(target_os = "windows")]
async fn install_cuda() {
    println!("checking for cuda installation...");
}

#[cfg(target_os = "linux")]
async fn install_cuda() {
    // check what distro we're running on
    let output = Command::new("lsb_release")
        .arg("-a")
        .output()
        .expect("failed to execute process");
    let distro = String::from_utf8_lossy(&output.stdout);
    let distro = distro.trim();
    println!("Checking for CUDA installation on \n{}", distro);

    // check if cuda is already installed
    let output = Command::new("nvidia-smi")
        .arg("--query-gpu=name")
        .output()
        .expect("failed to execute process");
    let installed = String::from_utf8_lossy(&output.stdout);
    let installed = installed.trim();
    if installed != "" {
        println!("CUDA already installed on {}", distro);
        return;
    }

    // install cuda 12.4 on ubuntu or fedora after checking what distro is.
    if distro.contains("Ubuntu") {
        let _ = Command::new("sudo")
            .arg("apt")
            .arg("install")
            .arg("-y")
            .arg("nvidia-driver")
            .output()
            .expect("failed to execute process");
        let _ = Command::new("sudo")
            .arg("apt")
            .arg("install")
            .arg("-y")
            .arg("cuda-toolkit")
            .output()
            .expect("failed to execute process");
    } else if distro.contains("Pop") {
        let _ = Command::new("sudo")
            .arg("apt")
            .arg("install")
            .arg("-y")
            .arg("nvidia-driver")
            .output()
            .expect("failed to execute process");
        let _ = Command::new("sudo")
            .arg("apt")
            .arg("install")
            .arg("-y")
            .arg("cuda-toolkit")
            .output()
            .expect("failed to execute process");
    } else if distro.contains("fedora") {
        let _ = Command::new("sudo")
            .arg("dnf")
            .arg("install")
            .arg("-y")
            .arg("nvidia-driver")
            .output()
            .expect("failed to execute process");
        let _ = Command::new("sudo")
            .arg("dnf")
            .arg("install")
            .arg("-y")
            .arg("cuda-toolkit")
            .output()
            .expect("failed to execute process");
    } else {
        println!("Unknown distro: {}", distro);
    }
}

pub fn run_cuda_setup() -> impl std::future::Future<Output = ()> {
    async {
        install_cuda().await;
    }
}
