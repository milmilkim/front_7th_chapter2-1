const MainLayout = () => {
  return /*html*/ `
        <header>
          메뉴 테스트
          <nav data-router-link="/">홈</nav>
          <nav data-router-link="/detail">디테일</nav>
        </header>
        <div id="router-view"></div>
        <footer>푸터</footer>
        `;
};

export default MainLayout;
