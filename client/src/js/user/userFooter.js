export async function loadUserFooter() {
  const footerContainer = document.getElementById('userFooter');

  if (!footerContainer) {
    console.warn('userFooter container not found in HTML');
    return;
  }

  try {
    const response = await fetch('/src/components/userFooter.html');

    if (!response.ok) {
      throw new Error(`Failed to load footer: ${response.status}`);
    }

    const html = await response.text();
    footerContainer.innerHTML = html;

    console.log('✅ User footer loaded successfully');
  } catch (error) {
    console.error('❌ Error loading user footer:', error);

    // Fallback basic footer
    footerContainer.innerHTML = `
      <footer class="footer">
        <p>&copy; 2024 Grace Chapel Church</p>
      </footer>
    `;
  }
}

// Export init function
export function init() {
  loadUserFooter();
}