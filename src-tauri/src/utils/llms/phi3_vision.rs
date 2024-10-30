use anyhow::Result;
use mistralrs::{IsqType, TextMessageRole, VisionLoaderType, VisionMessages, VisionModelBuilder};

pub async fn run() -> Result<()> {
    let model =
        VisionModelBuilder::new("microsoft/Phi-3.5-vision-instruct", VisionLoaderType::Phi3V)
            .with_isq(IsqType::Q4K)
            .with_logging()
            .build()
            .await?;
    Ok(())
}
