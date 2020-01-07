/* global Model, CatListView, CatImgView, CatFormView, Octopus */

const win = window;
window.document.addEventListener('DOMContentLoaded', () => {
  const doc = window.document;
  const data = [{
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

    it('should be able to update cat\'s data', () => {
      const catIdx = 2;
      const newCatData = {
        name: 'aaa',
        url: 'bbbb',
      };
      model.update(newCatData, catIdx);
      expect(model.getCats()[catIdx]).toEqual({
        ...data[catIdx],
        ...newCatData,
      });
    });
  });

  describe('App:View', () => {
    let model;
    let view;
    let octopus;
    const admBtn = doc.querySelector('button.adm-btn');
    const saveBtn = doc.querySelector('button.save-btn');
    const cancelBtn = doc.querySelector('button.cancel-btn');
    const catFormCtnr = doc.querySelector('.cat-form-ctnr');
    const catForm = doc.querySelector('form.cat-form');
    const catNameInput = doc.querySelector('#cat-name-input');
    const catUrlInput = doc.querySelector('#cat-img-url-input');
    const catClickInput = doc.querySelector('#cat-click-input');

    describe('View:Intergration', () => {
      beforeEach(() => {
        model = new Model(data);
        view = {
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
        octopus = new Octopus(model, view);
        octopus.init();
      });

      afterEach(() => {
        octopus.unmount();
      });

      describe('Cat List', () => {
        it('should change cat\'s image, name & click counter when click on a button', () => {
          doc.querySelector('#cat2').click();
          expect(doc.querySelector('p.click-counter-text').textContent).toContain(data[1].clickCounter);
          expect(doc.querySelector('img.cat-img').getAttribute('src')).toContain(data[1].url);
        });
      });

      describe('Cat Img', () => {
        it('should have only one cat image', () => {
          expect(doc.querySelectorAll('img.cat-img').length).toBe(1);
          expect(doc.querySelector('img.cat-img').getAttribute('src')).toBeDefined();
        });

        it('should have only one click counter text', () => {
          expect(doc.querySelectorAll('p.click-counter-text').length).toBe(1);
          expect(doc.querySelector('p.click-counter-text').textContent).toContain(' click(s)');
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

      xdescribe('Cat Form', () => {
        it('should hide cat form by default', () => {
          expect(catFormCtnr.classList.contains('d-none')).toBe(true);
        });

        it('should toggle displaying cat form when click on Admin button', () => {
          admBtn.click();
          expect(catFormCtnr.classList.contains('d-none')).toBe(false);
          admBtn.click();
          expect(catFormCtnr.classList.contains('d-none')).toBe(true);
        });

        it('should populate cat form\'s inputs when show cat form', () => {
          const firstCat = data[0];

          admBtn.click();
          expect({
            name: catNameInput.value,
            url: catUrlInput.value,
            clickCounter: parseInt(catClickInput.value, 10),
          }).toEqual(firstCat);
        });

        it('should clear cat form\'s inputs when hide cat form', () => {
          const firstCat = data[0];

          admBtn.click();
          expect({
            name: catNameInput.value,
            url: catUrlInput.value,
            clickCounter: parseInt(catClickInput.value, 10),
          }).toEqual(firstCat);
        });

        it('should edit selected cat when click on Save button', () => {
          const catImg = doc.querySelector('img.cat-img');
          const newCat = {
            name: 'New cat name',
            clickCounter: 3,
            url: 'https://placehold.it/400x300',
          };
          admBtn.click();
          catNameInput.value = newCat.name;
          catUrlInput.value = newCat.url;
          catClickInput.value = newCat.clickCounter;
          saveBtn.click();

          // BUG: by somehow the view stores wrong ref to these below elements, (even though the view should be unmount() &  re-init() after each spec), so the view modifies wrong elements & the selected elements here are not those modified ones
          expect(doc.querySelector('p.click-counter-text').textContent).toBe('3 click(s)');
          expect(catImg.getAttribute('src')).toBe(newCat.url);
        });

        it('should hide form when click on Save button', () => {
          expect(catFormCtnr.classList.contains('d-none')).toBe(true);
          admBtn.click();
          expect(catForm.classList.contains('d-none')).toBe(false);
          saveBtn.click();
          expect(catFormCtnr.classList.contains('d-none')).toBe(true);
        });
      });
    });

    describe('View:CatListView', () => {
      let catListView;
      beforeEach(() => {
        catListView = new CatListView();
      });

      afterEach(() => {
        // catListView.unmount();
      });

      it('should call mount() method when init', () => {
        const spyOnMount = spyOn(catListView, 'mount');
        catListView.init(data, () => {});
        expect(spyOnMount).toHaveBeenCalled();
        catListView.unmount();
      });

      it('should render numbers of buttons equal to amount of cats when init', () => {
        catListView.init([...data].splice(1), () => {});
        expect(catListView.catListElem.childElementCount).toBe(4);
        catListView.unmount();
      });
    });

    describe('View:CatImgView', () => {
      let catImgView;
      beforeEach(() => {
        catImgView = new CatImgView();
      });

      afterEach(() => {
        // catImgView.unmount();
      });

      it('should call mount() & render() methods when init', () => {
        const spyOnMount = spyOn(catImgView, 'mount');
        const spyOnRender = spyOn(catImgView, 'render');
        const spyOnSetCat = spyOn(catImgView, 'setCat');
        catImgView.init(data[1], () => {});
        expect(spyOnMount).toHaveBeenCalled();
        expect(spyOnRender).toHaveBeenCalled();
        expect(spyOnSetCat).toHaveBeenCalled();
      });

      it('should be able to save selected cat', () => {
        catImgView.init(data[2], () => {});
        expect(catImgView._cat).toEqual(data[2]);
        catImgView.unmount();
      });
    });

    describe('View:CatFormView', () => {
      let catFormView;
      beforeEach(() => {
        catFormView = new CatFormView();
      });

      afterEach(() => {
        catFormView.reset();
      });

      it('should be able to select DOMs', () => {
        expect(catFormView.admBtn).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.saveBtn).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.cancelBtn).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.catFormCtnr).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.catForm).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.catNameInput).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.catUrlInput).toBeInstanceOf(win.HTMLElement);
        expect(catFormView.catClickInput).toBeInstanceOf(win.HTMLElement);
      });

      it('should be able to store cat form show/hide status', () => {
        catFormView.hideCatForm();
        expect(catFormView.isHideCatForm).toBe(true);
        catFormView.showCatForm(data[0]);
        expect(catFormView.isHideCatForm).toBe(false);
      });
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
