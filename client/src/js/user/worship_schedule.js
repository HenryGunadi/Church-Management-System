let currentSlide = 0;
const slides = [
  {
    title: '"We RISE"',
    subtitle: "Sunday",
    date: "09:00-10:30<br>11:00-12:30",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  },
  {
    title: '"Growing Together"',
    subtitle: "Wednesday",
    date: "19:00-20:30",
    text: "Join us for our midweek service where we dive deeper into God's Word and encourage one another in faith. Experience meaningful fellowship and spiritual growth in a welcoming environment.",
  },
  {
    title: '"Youth Ignite"',
    subtitle: "Friday",
    date: "18:00-19:30",
    text: "A dynamic service designed for our youth community. Experience powerful worship, relevant teaching, and connect with peers who share your faith journey. Come as you are and be inspired!",
  },
];

function changeSlide(direction) {
  currentSlide += direction;
  if (currentSlide < 0) currentSlide = slides.length - 1;
  if (currentSlide >= slides.length) currentSlide = 0;

  const slide = slides[currentSlide];
  document.querySelector(".slide h2").textContent = slide.title;
  document.querySelector(".slide h3").textContent = slide.subtitle;
  document.querySelector(".slide .date").innerHTML = slide.date;
  document.querySelector(".slide p:last-child").textContent = slide.text;
}

function toggleDropdown(element) {
  const content = element.querySelector(".dropdown-content");
  const icon = element.querySelector(".dropdown-icon");

  // Close all other dropdowns
  document.querySelectorAll(".schedule-dropdown").forEach((dropdown) => {
    if (dropdown !== element) {
      dropdown.classList.remove("active");
      dropdown.querySelector(".dropdown-content").classList.remove("open");
      dropdown.querySelector(".dropdown-icon").classList.remove("open");
    }
  });

  // Toggle current dropdown
  element.classList.toggle("active");
  content.classList.toggle("open");
  icon.classList.toggle("open");
}
