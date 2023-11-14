const handleDragOver = (event) => {
  event.preventDefault();
  event.dataTransfer.dropEffect = "copy";
};

const handleDrop = (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  fileInput.files = event.dataTransfer.files;
  dropArea.style.border = "2px dashed #ccc";

  submitForm();
};

const handleFileSelection = (event) => {
  event.preventDefault();
  const fileInput = document.getElementById("fileInput");
  const dropArea = document.getElementById("dropArea");

  fileInput.files = event.target.files;
  dropArea.style.border = "2px dashed #ccc";
  submitForm();
};

const submitForm = () => {
  const form = document.getElementById("uploadForm");
  const formData = new FormData(form);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => response.blob())
    .then((blob) => {
      // Create a download link

      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = "undertekster.srt";
      // Trigger the download
      downloadLink.click();
    })
    .catch((error) => {
      console.error("Error: ", error);
    });
};
