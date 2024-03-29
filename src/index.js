(() => {

let Composite;
let Engine;
let Render;
let Runner;

let engine;
let render;
let canvasContainer;
const containerId = 'mario-canvas-container';
let canvasW = 0;
let canvasH = 0;

// player vars
let player;

let pageScrollCoupling;

const createAliases = () => {
  ({ Composite, Engine, Render, Runner } = Matter);
};

const initRender = () => {
  render = Render.create({
    element: canvasContainer,
    engine,
    options: {
      width: canvasW,
      height: canvasH,
      wireframes: false,
      background: 'transparent',
    },
  });
  canvasContainer.querySelector('canvas').style.pointerEvents = 'none';
};

const initWorld = (SPRITES) => {
  const pageWorldOptions = {
    Matter,
    canvasW,
    canvasH,
  };
  const pageWorld = new PageWorld(pageWorldOptions);
  const wallsAndGround = pageWorld.createWallsAndGround();
  // const elms = pageWorld.createBodiesForHtmlElements0();
  const elms = pageWorld.createBodiesForHtmlElements();
  pageScrollCoupling = new PageScrollCoupling(Matter, engine);

  addPlayer(SPRITES);

  const allBodies = [...wallsAndGround, ...elms];
  Composite.add(engine.world, allBodies);
};

const addPlayer = (SPRITES) => {
  player = new Player(engine, render, SPRITES).playerBody;
  Composite.add(engine.world, player);
  
  pageScrollCoupling.setPlayer(player);

  
  document.body.addEventListener('resetplayer.mario', () => {
    Composite.remove(engine.world, player);
    addPlayer(SPRITES);
  }, { once: true });
}

// make sure body has full height (to cover cases where it has been set to 100%, but content is higher)
const setBodyHeight = () => {
  const htmlElm = document.body.parentNode;
  htmlElm.style.minHeight = '100%';
  htmlElm.style.height = 'auto';
  document.body.style.minHeight = '100dvh';
  document.body.style.height = 'auto';
};

// add css for making canvas display: block;
// otherwise giving it 100% height gives scrollbars
const setCanvasDisplay = () => {
  const styleEl = document.createElement("style");
  document.head.appendChild(styleEl);
  const styleSheet = styleEl.sheet;
  styleSheet.insertRule(`#${containerId} canvas { display: block; }`);
}

const addCanvasContainer = () => {
  canvasW = document.body.offsetWidth;
  canvasH = document.body.offsetHeight;
  canvasContainer = document.createElement('div');
  canvasContainer.id = containerId;
  canvasContainer.setAttribute('data-mario-ignore', '');
  const styles = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 0,
    width: 0,
    zIndex: 9999999999999999,
  };
  for (const s in styles) {
    canvasContainer.style[s] = styles[s];
  }
  document.body.appendChild(canvasContainer);
}

const initCanvas = () => {
  setBodyHeight();
  setCanvasDisplay();
  addCanvasContainer();
};

const initGame = (spriteBaseUrl) => {
  initCanvas();
  engine = Engine.create();
  const spriteManager = new SpriteManager(spriteBaseUrl);
  initRender();
  initWorld(spriteManager.SPRITES);

  const runner = Runner.create();
  Runner.run(runner, engine);

  Render.run(render);
};

const reset = () => {
  // remove Matter and canvas container from previous instance
  Matter = null;
  document.getElementById(containerId)?.remove();
  init();
};

// add event listeners for communication with app
const addEventListeners = () => {
  document.body.addEventListener('reset.easterEggGame', reset, { once: true });
};

const loadMatter = () => {
  const loadingPromise = new Promise((resolve, reject) => {
    const matterUrl = 'https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js';
    const script = document.createElement('script');
    script.src = matterUrl;
    script.addEventListener('load', resolve);
    script.addEventListener('error', (err) => reject(err));
    document.body.appendChild(script);
  });
  return loadingPromise;
};

const init = () => {
  const spriteBaseUrl = 'https://jaron.nl/play/mario/sprites/';
  loadMatter()
    .then(() => {
      window.scrollTo({ top: 0, behavior: 'instant'});
      createAliases();
      initGame(spriteBaseUrl);
      addEventListeners();
      // new PageScrollCoupling(Matter, engine, player);
      // new PlatformRevealer(render);
      new MarioMenu(render);
    })
    .catch((err) => {
      // eslint-disable-next-line
      console.log('can not load', err);
    });
};

console.clear();
init();

})();