from pypdf import PdfReader


def extract_pdf_text(path: str) -> str:
    reader = PdfReader(path)
    chunks: list[str] = []
    for page in reader.pages:
        text = page.extract_text() or ""
        if text.strip():
            chunks.append(text)
    return "\n".join(chunks)
