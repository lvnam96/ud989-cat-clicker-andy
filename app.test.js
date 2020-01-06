/* global Model, CatListView, CatImgView, Octopus */

window.document.addEventListener('DOMContentLoaded', () => {
  const doc = window.document;
  const data = [{
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
  }];

  describe('App:Model', () => {
    let model;

    beforeEach(() => {
      model = new Model(data);
    });

    it('should be setup succesfully', () => {
      expect(model.getCats()).toEqual(data);
    });

    it('should be able to get cats list', () => {
      expect(model.getCats()).toEqual(data);
    });

    it('should be able to get selected cat & its index', () => {
      const newCatIndex = 2;
      model.selectedCatIndex = newCatIndex;
      expect(model.selectedCatIndex).toBe(newCatIndex);
      expect(model.getSelectedCat()).toBe(model.getCats()[newCatIndex]);
    });

    it('should increase clickCounter prop', () => {
      const numOfClicks = 2;
      const newCatIndex = 1;
      for (let i = 0; i < numOfClicks; i += 1) model.increaseClickCounter();
      expect(model.getSelectedCat().clickCounter).toBe(numOfClicks);

      model.selectedCatIndex = newCatIndex;
      for (let i = 0; i < numOfClicks; i += 1) model.increaseClickCounter();
      expect(model.getSelectedCat().clickCounter).toBe(numOfClicks);
    });
  });

  fdescribe('App:View', () => {
    let model;
    let view;
    let octopus;

    beforeEach(() => {
      model = new Model(data);
      view = {
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
      octopus.init();
    });

    afterEach(() => {
      octopus.unmount();
    });

    afterAll(() => {
      octopus = undefined;
    });

    it('should have only one cat image', () => {
      expect(doc.querySelectorAll('img.cat-img').length).toBe(1);
      expect(doc.querySelector('img.cat-img').src).toBeDefined();
    });

    it('should have only one click counter text', () => {
      expect(doc.querySelectorAll('p.click-counter-text').length).toBe(1);
      expect(doc.querySelector('p.click-counter-text').textContent).toContain(' click(s)');
    });

    it('should render numbers of buttons equal to amount of cats', () => {
      expect(octopus.view.catListView.catListElem.childElementCount).toBe(5);
    });

    it('should update counter click text whenever the cat img is clicked', () => {
      const catImg = doc.querySelector('img.cat-img');
      const clickCounterText = doc.querySelector('p.click-counter-text');
      expect(clickCounterText.textContent).toBe('0 click(s)');
      catImg.click();
      catImg.click();
      expect(clickCounterText.textContent).toBe('2 click(s)');
    });
  });

  describe('App:Controller', () => {
    let model;
    let view;
    let octopus;

    beforeEach(() => {
      model = new Model(data);
      view = {
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
      octopus.init();
    });

    afterEach(() => {
      octopus.unmount();
    });

    afterAll(() => {
      octopus = undefined;
    });

    it('should mount needed elements into DOM tree', () => {
      expect(doc.querySelector('#catlist').childNodes.length).toBeGreaterThan(0);
      expect(doc.querySelector('#cat-img-ctnr').childNodes.length).toBeGreaterThan(0);
    });

    it('should show first cat in list when init the app', () => {
      expect(octopus.getSelectedCat()).toEqual(data[0]);
    });

    it('should update selected cat after a cat button has been clicked', () => {
      octopus.changeCatImg(2);
      expect(octopus.getSelectedCat()).toEqual(data[2]);
    });

    it('should update clickCounter prop of selected cat after increaseClickCounter() has been called multiple times', () => {
      octopus.increaseClickCounter();
      expect(octopus.getSelectedCat().clickCounter).toBe(1);

      octopus.changeCatImg(2);
      octopus.increaseClickCounter();
      octopus.increaseClickCounter();
      octopus.increaseClickCounter();
      expect(octopus.getSelectedCat().clickCounter).toBe(3);
    });
  });
});
