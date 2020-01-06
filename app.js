
const win = window;
const doc = win.document;

class Model {
  constructor(cats = [{ clickCounter: 0, url: '' }]) {
    this._cats = cats;
    this._selectedCatIndex = 0;

    this.getCats = this.getCats.bind(this);
    this.getSelectedCat = this.getSelectedCat.bind(this);
    this.increaseClickCounter = this.increaseClickCounter.bind(this);
  }

  get selectedCatIndex() {
    return this._selectedCatIndex;
  }

  set selectedCatIndex(idx) {
    this._selectedCatIndex = idx;
  }

  getCats() {
    return this._cats;
  }

  getSelectedCat() {
    return this._cats[this._selectedCatIndex];
  }

  increaseClickCounter(catIdx = this._selectedCatIndex) {
    const cat = this._cats[catIdx];
    this._update({
      ...cat,
      clickCounter: cat.clickCounter + 1,
    }, catIdx);
  }

  _update(cat, idx) {
    if (!cat || typeof idx !== 'number') throw new Error('Arguments must be provided!');
    this.copyCats = [...this._cats];
    this.copyCats[idx] = cat;
    this._cats = this.copyCats;
  }
}

class Octopus {
  constructor(model = new Model(), view) {
    this.model = model;
    this.view = view;

    this.unmount = this.unmount.bind(this);
    this.init = this.init.bind(this);
    this.changeCatImg = this.changeCatImg.bind(this);
    this.getCats = this.model.getCats.bind(this.model);
    this.getSelectedCat = this.model.getSelectedCat.bind(this.model);
    this.increaseClickCounter = this.increaseClickCounter.bind(this);
  }

  unmount() {
    this.view.unmount();
  }

  init() {
    this.view.init(this.getCats());
    return this;
  }

  changeCatImg(selectedCatIndex) {
    this.model.selectedCatIndex = selectedCatIndex;// update data in "model"
    this.view.catImgView.setCat(this.getSelectedCat());// pass updated data into "view"
    this.view.catImgView.render(this.increaseClickCounter);// render the needed part in "view"
  }

  increaseClickCounter() {
    this.model.increaseClickCounter();// update data in "model"
    this.view.catImgView.setCat(this.getSelectedCat());// pass updated data into "view"
    this.view.catImgView.renderClickCounterText();// render the needed part in "view"
  }

  getSelectedCatIndex() {
    return this.model.selectedCatIndex;
  }
}

class CatListView {
  constructor() {
    this.catListElem = doc.querySelector('#catlist');

    this.mount = this.mount.bind(this);
    this.unmount = this.unmount.bind(this);
    this.init = this.init.bind(this);
  }

  init(cats, changeImgViewCallback) {
    this.mount(cats, changeImgViewCallback);
  }

  mount(cats = [], changeImgViewCallback) {
    if (typeof changeImgViewCallback !== 'function') throw new Error('"changeImgViewCallback" must be provided');
    const fragment = new win.DocumentFragment();
    cats.forEach((cat = {}, i) => {
      const btn = doc.createElement('button');
      btn.classList.add('btn', 'btn-outline-primary');
      btn.id = `cat${i + 1}`;
      btn.textContent = `Cat ${i + 1}`;
      // eslint-disable-next-line no-unused-vars
      btn.addEventListener('click', ((copyCat, idx) => (e) => {
        changeImgViewCallback(idx);
      })(cat, i));
      fragment.appendChild(btn);
    });
    this.catListElem.appendChild(fragment);
  }

  unmount() {
    // for memory leak concern with event listeners, see https://stackoverflow.com/questions/12528049/if-a-dom-element-is-removed-are-its-listeners-also-removed-from-memory
    const { catListElem } = this;
    while (catListElem.firstChild) {
      catListElem.removeChild(catListElem.firstChild);
    }
  }
}

class CatImgView {
  constructor() {
    this.cat = null;
    this.clickCounterText = null;
    this.catImg = null;
    this.handleClickImg = null;
    this.catImgCtnr = doc.querySelector('#cat-img-ctnr');

    this.mount = this.mount.bind(this);
    this.unmount = this.unmount.bind(this);
    this.init = this.init.bind(this);
    this.render = this.render.bind(this);
    this.setCat = this.setCat.bind(this);
    this.renderClickCounterText = this.renderClickCounterText.bind(this);
  }

  init(cat, increaseClickCounterCallback) {
    if (!cat) throw new Error('"cat" argument must be provided!');

    this.handleClickImg = () => {
      increaseClickCounterCallback();
      this.renderClickCounterText();
    };
    this.mount();
    this.setCat(cat);
    this.render();
  }

  setCat(cat) {
    this.cat = cat;
  }

  render() {
    // dont need to clean old event listener (even though this method will be called many times)
    // this.catImg.removeEventListener('click', this.handleClickImg);

    this.catImg.src = this.cat.url;
    this.renderClickCounterText();
  }

  renderClickCounterText() {
    this.clickCounterText.textContent = `${this.cat.clickCounter} click(s)`;
  }

  mount() {
    const fragment = new DocumentFragment();
    this.clickCounterText = doc.createElement('p');
    this.clickCounterText.classList.add('click-counter-text');
    this.catImg = doc.createElement('img');
    this.catImg.classList.add('cat-img');
    this.catImg.addEventListener('click', this.handleClickImg);
    fragment.append(this.clickCounterText, this.catImg);
    this.catImgCtnr.appendChild(fragment);
  }

  unmount() {
    const { catImgCtnr } = this;
    this.catImg.removeEventListener('click', this.handleClickImg);
    while (catImgCtnr.firstChild) {
      catImgCtnr.removeChild(catImgCtnr.firstChild);
    }

    delete this.catImg;
    delete this.clickCounterText;
    delete this.catImgCtnr;
    delete this.handleClickImg;
  }
}

doc.addEventListener('DOMContentLoaded', () => {
  const model = new Model([{
    url: './cat_picture1.jpg',
    clickCounter: 0,
  }, {
    url: './cat_picture2.jpeg',
    clickCounter: 0,
  }, {
    url: './cat_picture3.jpeg',
    clickCounter: 0,
  }, {
    url: './cat_picture4.jpeg',
    clickCounter: 0,
  }, {
    url: './cat_picture5.jpeg',
    clickCounter: 0,
  }]);

  let octopus;
  const view = {
    catListView: new CatListView(),
    catImgView: new CatImgView(),
    init(cats = []) {
      this.catListView.init(cats, octopus.changeCatImg);
      this.catImgView.init(octopus.getSelectedCat(), octopus.increaseClickCounter);
    },
    unmount() {
      this.catListView.unmount();
      this.catImgView.unmount();
    },
  };

  octopus = new Octopus(model, view);
  if (!(doc.getElementById('tests-script'))) octopus.init();
});
