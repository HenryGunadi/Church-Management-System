function filterMinistries(category) {
  // Update active button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // In a real application, this would filter the ministry cards
  console.log("Filtering by:", category);
}

function handleSubmit(event) {
  event.preventDefault();

  // Get form data
  const formData = new FormData(event.target);
  const data = {};

  formData.forEach((value, key) => {
    if (data[key]) {
      if (Array.isArray(data[key])) {
        data[key].push(value);
      } else {
        data[key] = [data[key], value];
      }
    } else {
      data[key] = value;
    }
  });

  console.log("Form submitted:", data);
  alert(
    "Terima kasih! Aplikasi Anda telah diterima. Kami akan menghubungi Anda segera."
  );
  event.target.reset();
}
