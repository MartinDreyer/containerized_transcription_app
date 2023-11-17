const replaceExtension = (fileName) => {
  const parts = fileName.split(".");
  if (parts.length > 1) {
    parts[parts.length - 1] = "srt";

    return parts.join(".");
  }
};

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
  const fileInput = document.getElementById("fileInput");
  const fileName = replaceExtension(fileInput.files[0].name);

  fetch("/upload", {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      // Check if the request was successful (status code 2xx)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Return the blob promise
      return response.blob();
    })
    .then((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
    })
    .catch((error) => {
      console.error("Error: ", error);
    });
};
