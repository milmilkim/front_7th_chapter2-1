const Footer = () => {
  const year = new Date().getFullYear();

  return /*html*/ `
  <footer class="bg-white shadow-sm">
    <div class="max-w-md mx-auto py-8 text-center text-gray-500">
      <p>© ${year} 항해플러스 프론트엔드 쇼핑몰</p>
    </div>
  </footer>
    `;
};

export default Footer;
