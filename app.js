
const doc = window.document;

class Model {
  constructor(cats = [{ clickCounter: 0, url: '' }]) {
    this._cats = cats;
    this._selectedCatIndex = 0;

    this.getCats = this.getCats.bind(this);
    this.getSelectedCat = this.getSelectedCat.bind(this);
    this.increaseClickCounter = this.increaseClickCounter.bind(this);
    this.update = this.update.bind(this);
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
    this.update({
      clickCounter: cat.clickCounter + 1,
    }, catIdx);
  }

  update(cat, idx) {
    if (!cat || typeof idx !== 'number') throw new Error('Arguments must be provided!');
    this.copyCats = [...this._cats];
    this.copyCats[idx] = {
      ...this.copyCats[idx],
      ...cat,
    };
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
    this.handleUpdateCat = this.handleUpdateCat.bind(this);
  }

  unmount() {
    this.view.unmount();
  }

  init() {
    this.view.init(this.getCats(), this.changeCatImg, this.getSelectedCat, this.increaseClickCounter, this.handleUpdateCat);
    return this;
  }

  changeCatImg(selectedCatIndex) {
    this.model.selectedCatIndex = selectedCatIndex;// update data in "model"
    this.view.catImgView.setCat(this.getSelectedCat());// pass updated data into "view"
    this.view.catImgView.render();// render the needed part in "view"
  }

  increaseClickCounter() {
    this.model.increaseClickCounter();// update data in "model"
    this.view.catImgView.setCat(this.getSelectedCat());// pass updated data into "view"
    this.view.catImgView.renderClickCounterText();// render the needed part in "view"
  }

  getSelectedCatIndex() {
    return this.model.selectedCatIndex;
  }

  handleUpdateCat(name = '', url = '', clickCounter = 0, cb) {
    this.model.update({
      name,
      url,
      clickCounter,
    }, this.getSelectedCatIndex());
    this.view.catImgView.setCat(this.getSelectedCat());// pass updated data into "view"
    this.view.catImgView.render();// render the needed part in "view"
    if (typeof cb === 'function') cb();
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
    const fragment = new window.DocumentFragment();
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
    this._cat = null;
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
    if (typeof increaseClickCounterCallback !== 'function') throw new Error('"increaseClickCounterCallback" argument must be provided!');

    this.handleClickImg = () => {
      increaseClickCounterCallback();
      this.renderClickCounterText();
    };
    this.catImgCtnr = doc.querySelector('#cat-img-ctnr');
    this.mount();
    this.setCat(cat);
    this.render();
  }

  setCat(cat) {
    this._cat = cat;
  }

  render() {
    // dont need to clean old event listener (even though this method will be called many times)
    // this.catImg.removeEventListener('click', this.handleClickImg);

    this.catImg.setAttribute('src', this._cat.url);
    this.renderClickCounterText();
  }

  renderClickCounterText() {
    this.clickCounterText.textContent = `${this._cat.clickCounter} click(s)`;
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
    if (this.catImg) this.catImg.removeEventListener('click', this.handleClickImg);
    while (catImgCtnr && catImgCtnr.firstChild) {
      catImgCtnr.removeChild(catImgCtnr.firstChild);
    }

    // delete this.catImg;
    // delete this.clickCounterText;
    // delete this.catImgCtnr;
    // delete this.handleClickImg;
  }
}

class CatFormView {
  constructor() {
    this.cat = null;
    this.admBtn = doc.querySelector('button.adm-btn');
    this.saveBtn = doc.querySelector('button.save-btn');
    this.cancelBtn = doc.querySelector('button.cancel-btn');
    this.catFormCtnr = doc.querySelector('.cat-form-ctnr');
    this.catForm = doc.querySelector('.cat-form');
    this.catNameInput = doc.querySelector('#cat-name-input');
    this.catUrlInput = doc.querySelector('#cat-img-url-input');
    this.catClickInput = doc.querySelector('#cat-click-input');
    this.isHideCatForm = this.catFormCtnr.classList.contains('d-none');

    // this.toggleCatForm = this.toggleCatForm.bind(this);
    this.hideCatForm = this.hideCatForm.bind(this);
    this.showCatForm = this.showCatForm.bind(this);
    this.render = this.render.bind(this);
    this.init = this.init.bind(this);
    this.reset = this.reset.bind(this);
    this.handleClickAdmBtn = (getSelectedCat) => (e) => {
      if (this.isHideCatForm) this.showCatForm(getSelectedCat());
      else this.hideCatForm();
    };
    this.handleClickCancelBtn = (e) => {
      this.hideCatForm();
    };
    this.handleClickSaveBtn = (handleUpdateCat) => (e) => {
      e.preventDefault();
      handleUpdateCat(this.catNameInput.value, this.catUrlInput.value, parseInt(this.catClickInput.value, 10) || 0);
      this.hideCatForm();
    };
    this.handleSubmitForm = (e) => {
      e.preventDefault();
    };
    this.reset = this.reset.bind(this);
  }

  init(handleUpdateCat, getSelectedCat) {
    this.admBtn.addEventListener('click', this.handleClickAdmBtn(getSelectedCat));
    this.cancelBtn.addEventListener('click', this.handleClickAdmBtn);
    this.saveBtn.addEventListener('click', this.handleClickSaveBtn(handleUpdateCat));
    this.catForm.addEventListener('submit', this.handleSubmitForm);
    this.hideCatForm();
  }

  // toggleCatForm() {
  //   if (this.isHideCatForm) this.hideCatForm();
  //   else this.showCatForm();
  // }

  hideCatForm() {
    delete this.cat;
    this.isHideCatForm = true;
    this.render();
  }

  showCatForm(cat) {
    if (!cat) throw new Error('"cat" argument must be provided!');
    this.cat = cat;
    this.isHideCatForm = false;
    this.render();
  }

  _populateInputs() {
    this.catNameInput.value = this.cat.name;
    this.catUrlInput.value = this.cat.url;
    this.catClickInput.value = this.cat.clickCounter;
  }

  _clearInputs() {
    this.catNameInput.value = '';
    this.catUrlInput.value = '';
    this.catClickInput.value = '';
  }

  render() {
    if (this.isHideCatForm) {
      this._clearInputs();
      this.catFormCtnr.classList.add('d-none');
    } else {
      this.catFormCtnr.classList.remove('d-none');
      this._populateInputs();
    }
  }

  reset() {
    this.admBtn.removeEventListener('click', this.handleClickAdmBtn);
    this.cancelBtn.removeEventListener('click', this.handleClickAdmBtn);
    this.saveBtn.removeEventListener('click', this.handleClickSaveBtn);
    this.catForm.removeEventListener('submit', this.handleSubmitForm);
    this.hideCatForm();
  }
}

doc.addEventListener('DOMContentLoaded', () => {
  const model = new Model([{
    name: 'Cat 1',
    url: './cat_picture1.jpg',
    clickCounter: 0,
  }, {
    name: 'Cat 2',
    url: './cat_picture2.jpeg',
    clickCounter: 0,
  }, {
    name: 'Cat 3',
    url: './cat_picture3.jpeg',
    clickCounter: 0,
  }, {
    name: 'Cat 4',
    url: './cat_picture4.jpeg',
    clickCounter: 0,
  }, {
    name: 'Cat 5',
    url: './cat_picture5.jpeg',
    clickCounter: 0,
  }]);

  const view = {
    catListView: new CatListView(),
    catImgView: new CatImgView(),
    catFormView: new CatFormView(),
    init(cats = [], changeCatImg, getSelectedCat, increaseClickCounter, handleUpdateCat) {
      this.catListView.init(cats, changeCatImg);
      this.catImgView.init(getSelectedCat(), increaseClickCounter);
      this.catFormView.init(handleUpdateCat, getSelectedCat);
    },
    unmount() {
      this.catListView.unmount();
      this.catImgView.unmount();
      this.catFormView.reset();
    },
  };

  const octopus = new Octopus(model, view);
  if (!(doc.getElementById('tests-script'))) octopus.init();
});
