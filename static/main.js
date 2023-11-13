const validateForm = () => {
  const fileInput = document.getElementById("fileInput");
  if (fileInput.files.length === 0) {
    alert("Vælg en fil, før du trykker upload");
    return false; // Prevent form submission
  }
  return true; // Allow form submission
};

const submitForm = (e) => {
  if (validateForm()) {
    e.preventDefault();

    fetch("/upload", {
      method: "POST",
      body: new FormData(document.querySelector("form")),
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const a = document.createElement("a");
        a.href = url;

        // Extract the filename from the content-disposition header
        const contentDisposition = response.headers.get("content-disposition");
        const filenameMatch =
          contentDisposition && contentDisposition.match(/filename="(.+)"/);
        const filename = filenameMatch ? filenameMatch[1] : "download";

        // Set the download attribute and trigger a click to start the download
        a.setAttribute("download", filename);
        a.click();

        // Clean up the temporary link
        window.URL.revokeObjectURL(url);
      })
      .catch((error) => {
        // Handle errors
        console.error("Error:", error);
      });
  }
};
