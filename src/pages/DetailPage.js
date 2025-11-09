const createFragment = (html) => {
  const template = document.createElement("template");
  template.innerHTML = html.trim();
  return template.content;
};

const DetailPage = ({ root }) => {
  const getTemplate = () => /*html*/ `
    <h1 class="text-xl">디테일 컨텐츠</h1>
  `;

  const render = () => {
    const fragment = createFragment(getTemplate());
    root.replaceChildren(fragment);
  };

  render();

  return { render };
};

export default DetailPage;
