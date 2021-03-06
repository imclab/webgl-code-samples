// GLOBAL anchor, _demo, for requestAnimationFrame browser hooks
var _demo,
    gameOver = false,
    gameDimensions = 3,
    cubeSeparation = 25,
    cubeDim = 10,
    jigger = new THREE.Vector3(0.1,0.1,0.1),
    turn = 1,
    rays = [],
    userColor1 = new THREE.Color(0xFF434C),
    userColor2 = new THREE.Color(0x30394F),
    cubeColor1 = new THREE.Color(0x6ACEEB),
    cubeColor2 = new THREE.Color(0xFFFFFF),
    cubeColor3 = new THREE.Color(0xCCCCCC),
    whoFirst = 'user2';



  // got this silly color scheme here:
  // https://kuler.adobe.com/Seaman-Deckhand-color-theme-3185617/

function init() {
  $('#jqv').text($.fn.jquery);
  $('#tjsv').text(THREE.REVISION);

  _demo = new Demo.Scene("ray-intersection");
  _demo.rotateCamera = true;
  listeners();

  createCubes();
  createRays();


  // start the animation
  // this also does all of the setup.  i've encapsulated all of this work for brevity.
  _demo.animate();

  if(whoFirst === 'user2'){
    turn *= -1;
    window.setTimeout(function(){
      userTurn();
    }, 500);
  }
}

function listeners () {

  $("#ray-intersection").click(function (e) {
    if(!gameOver){
      selectCube(e);
    }
  });

  $("#toggle-arrows").click(function () {
    toggleArrows();
  });

  $("#toggle-rotation").click(function () {
    _demo.rotateCamera = (_demo.rotateCamera) ? false : true;
  });
}

function createCubes() {

  var i,j,k,
    num = 0,
    geo = new THREE.CubeGeometry(cubeDim, cubeDim, cubeDim),
    materialVerts = new THREE.MeshLambertMaterial({color: cubeColor1}),
    materialOutside = new THREE.MeshLambertMaterial({color: cubeColor2}),
    materialInside = new THREE.MeshLambertMaterial({color: cubeColor3});

  // this approach (with a little jiggering), should work for any dimesion tic-tac-toe setup.  e.g. 4x4x4
  for(i = 0; i < gameDimensions; i++){
    for(j = 0; j < gameDimensions; j++){
      for(k = 0; k < gameDimensions; k++){
        var mat;
        if(i * j * k === 1){
          // center cube
          mat = materialInside;
        } else if (i * j === 1 || i * k === 1 || j * k === 1) {
          // axes cubes.   I had to look it up but yes, Axes is plural of Axis. Who knew!  =D
          mat = materialVerts;
        } else {
          //everything else
          mat = materialOutside;
        }

        var mesh = new THREE.Mesh(geo.clone(), mat.clone());
        mesh.cubeNum = num;
        mesh.position = new THREE.Vector3((i-1)*cubeSeparation, (j-1)*cubeSeparation, (k-1)*cubeSeparation);

        num++;
        // instead of using scene.children, I create a specific array for ray collisions.
        _demo.collisions.push(mesh);
        _demo.scene.add(mesh);
      }
    }
  }
}

function createRays() {

  var setup = {
      xDirection: xDirection = new THREE.Vector3(-1,0,0),
      yDirection: yDirection = new THREE.Vector3(0,-1,0),
      zDirection: zDirection = new THREE.Vector3(0,0,-1),
      xy1Direction: xy1Direction = new THREE.Vector3(-1,-1,0).normalize(),
      xy2Direction: xy2Direction = new THREE.Vector3(-1,1,0).normalize(),
      xz1Direction: xz1Direction = new THREE.Vector3(-1,0,-1).normalize(),
      xz2Direction: xz2Direction = new THREE.Vector3(-1,0,1).normalize(),
      yz1Direction: yz1Direction = new THREE.Vector3(0,-1,-1).normalize(),
      yz2Direction: yz2Direction = new THREE.Vector3(0,1,-1).normalize(),
      xyz1Direction: xyz1Direction = new THREE.Vector3(-1,-1,-1).normalize(),
      xyz2Direction: xyz2Direction = new THREE.Vector3(1,-1,-1).normalize(),
      xyz3Direction: xyz3Direction = new THREE.Vector3(-1,-1,1).normalize(),
      xyz4Direction: xyz4Direction = new THREE.Vector3(1,-1,1).normalize(),
      length: 20
  };


  // should be 27 of these guys.
  create2DVectors(setup);

  // should be 18 of these guys  (for a 3x3x3)
  create2DDiagonals(setup);

  // should be 4 of these guys
  create3DDiagonals(setup);
}

function create2DVectors (setup) {

  var i,j,
      x,y,z,
      arrow,
      origin,
      ray;

  // create 9 rays looking down X
  for(i = 0; i < gameDimensions; i++){
    for(j = 0; j < gameDimensions; j++){

      x = 4 * cubeSeparation;
      y = (i - 1) * cubeSeparation;
      z = (j - 1) * cubeSeparation;

      origin = new THREE.Vector3(x,y,z);
      arrow = new THREE.ArrowHelper(setup.xDirection, origin, setup.length, 0xFF0000);

      _demo.scene.add(arrow);
      _demo.arrows.push(arrow);

      ray = new THREE.Raycaster(origin, setup.xDirection);
      ray.num = '6';
      rays.push(ray);
    }
  }

  // create 9 rays looking down Y
  for(i = 0; i < gameDimensions; i++){
    for(j = 0; j < gameDimensions; j++){

      y = 4 * cubeSeparation;
      x = (i - 1) * cubeSeparation;
      z = (j - 1) * cubeSeparation;

      origin = new THREE.Vector3(x,y,z);
      arrow = new THREE.ArrowHelper(setup.yDirection, origin, setup.length, 0x00FF00);

      _demo.scene.add(arrow);
      _demo.arrows.push(arrow);

      ray = new THREE.Raycaster(origin, setup.yDirection);
      ray.num = '6';
      rays.push(ray);

    }
  }

  // create 9 rays looking down Z
  for(i = 0; i < gameDimensions; i++){
    for(j = 0; j < gameDimensions; j++){

      z = 4 * cubeSeparation;
      y = (i - 1) * cubeSeparation;
      x = (j - 1) * cubeSeparation;

      origin = new THREE.Vector3(x,y,z);
      arrow = new THREE.ArrowHelper(setup.zDirection, origin, setup.length, 0x0000FF);

      _demo.scene.add(arrow);
      _demo.arrows.push(arrow);

      ray = new THREE.Raycaster(origin, setup.zDirection);
      ray.num = '6';
      rays.push(ray);
    }
  }
}

function create2DDiagonals(setup) {

  var i,j,
      x,y,z,
      arrow1,
      arrow2,
      origin1,
      origin2,
      ray1,
      ray2;

  // create 6 rays for XY diagonals
  for(i = 0; i < gameDimensions; i++){

      x = 4 * cubeSeparation;
      y = 4 * cubeSeparation;
      z = (i - 1) * cubeSeparation;

      origin1 = new THREE.Vector3(x,y,z).add(jigger);
      origin2 = new THREE.Vector3(x,-y,z).add(jigger);

      arrow1 = new THREE.ArrowHelper(setup.xy1Direction, origin1, setup.length, 0xCC0000);
      arrow2 = new THREE.ArrowHelper(setup.xy2Direction, origin2, setup.length, 0xCC0000);

      _demo.scene.add(arrow1);
      _demo.scene.add(arrow2);

      _demo.arrows.push(arrow1);
      _demo.arrows.push(arrow2);

      ray1 = new THREE.Raycaster(origin1, setup.xy1Direction);
      ray2 = new THREE.Raycaster(origin2, setup.xy2Direction);

      ray1.num = '3';
      ray2.num = '3';

      rays.push(ray1);
      rays.push(ray2);
  }

  // create 6 rays for XZ diagonals
  for(i = 0; i < gameDimensions; i++){

      x = 4 * cubeSeparation;
      y = (i - 1) * cubeSeparation;
      z = 4 * cubeSeparation;

      origin1 = new THREE.Vector3(x,y,z).add(jigger);
      origin2 = new THREE.Vector3(x,y,-z).add(jigger);

      arrow1 = new THREE.ArrowHelper(setup.xz1Direction, origin1, setup.length, 0x00CC00);
      arrow2 = new THREE.ArrowHelper(setup.xz2Direction, origin2, setup.length, 0x00CC00);

      _demo.scene.add(arrow1);
      _demo.scene.add(arrow2);

      _demo.arrows.push(arrow1);
      _demo.arrows.push(arrow2);

      ray1 = new THREE.Raycaster(origin1, setup.xz1Direction);
      ray2 = new THREE.Raycaster(origin2, setup.xz2Direction);

      ray1.num = '3';
      ray2.num = '3';

      rays.push(ray1);
      rays.push(ray2);
  }

  // create 6 rays for YZ diagonals
  for(i = 0; i < gameDimensions; i++){

      x = (i - 1) * cubeSeparation;
      y = 4 * cubeSeparation;
      z = 4 * cubeSeparation;

      origin1 = new THREE.Vector3(x,y,z).add(jigger);
      origin2 = new THREE.Vector3(x,-y,z).add(jigger);

      arrow1 = new THREE.ArrowHelper(setup.yz1Direction, origin1, setup.length, 0x0000CC);
      arrow2 = new THREE.ArrowHelper(setup.yz2Direction, origin2, setup.length, 0x0000CC);

      _demo.arrows.push(arrow1);
      _demo.arrows.push(arrow2);

      _demo.scene.add(arrow1);
      _demo.scene.add(arrow2);

      ray1 = new THREE.Raycaster(origin1, setup.yz1Direction);
      ray2 = new THREE.Raycaster(origin2, setup.yz2Direction);

      ray1.num = '3';
      ray2.num = '3';

      rays.push(ray1);
      rays.push(ray2);

  }
}

function create3DDiagonals (setup) {

  var i,j,
      x,y,z,
      arrow1, arrow2, arrow3, arrow4,
      origin1, origin2, origin3, origin4,
      ray1, ray2, ray3, ray4,
      distance = 4 * cubeSeparation;

  x = distance;
  y = distance;
  z = distance;

  origin1 = new THREE.Vector3(x,y,z);
  origin2 = new THREE.Vector3(-x,y,z);
  origin3 = new THREE.Vector3(x,y,-z);
  origin4 = new THREE.Vector3(-x,y,-z);

  arrow1 = new THREE.ArrowHelper(setup.xyz1Direction, origin1, setup.length, 0x333333);
  arrow2 = new THREE.ArrowHelper(setup.xyz2Direction, origin2, setup.length, 0x333333);
  arrow3 = new THREE.ArrowHelper(setup.xyz3Direction, origin3, setup.length, 0x333333);
  arrow4 = new THREE.ArrowHelper(setup.xyz4Direction, origin4, setup.length, 0x333333);

  _demo.arrows.push(arrow1);
  _demo.arrows.push(arrow2);
  _demo.arrows.push(arrow3);
  _demo.arrows.push(arrow4);

  _demo.scene.add(arrow1);
  _demo.scene.add(arrow2);
  _demo.scene.add(arrow3);
  _demo.scene.add(arrow4);

  ray1 = new THREE.Raycaster(origin1, setup.xyz1Direction);
  ray2 = new THREE.Raycaster(origin2, setup.xyz2Direction);
  ray3 = new THREE.Raycaster(origin3, setup.xyz3Direction);
  ray4 = new THREE.Raycaster(origin4, setup.xyz4Direction);

  rays.push(ray1);
  rays.push(ray2);
  rays.push(ray3);
  rays.push(ray4);

}


function selectCube (event) {

  event.preventDefault();

  var mouse = {};

  // since this isn't a full screen app, lets use the dimensions of the container div.
  // OFFSET change.  Now I'll adjust the offset of the canvas element from the click.
  var leftOffset = _demo.jqContainer.offset().left;
  var topOffset = _demo.jqContainer.offset().top;

  mouse.x = ((event.clientX - leftOffset) / _demo.jqContainer.width()) * 2 -1;
  mouse.y = -((event.clientY - topOffset) / _demo.jqContainer.height()) * 2 + 1;

  var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
  _demo.projector.unprojectVector(vector, _demo.cameras.liveCam);

  var ray = new THREE.Raycaster(_demo.cameras.liveCam.position, vector.sub(_demo.cameras.liveCam.position).normalize());

  // Casting a ray to find if there is an intersection.
  var intersected = ray.intersectObjects( _demo.collisions );

  // only change the first (closest) intersected object.
  if(intersected.length > 0) {
    console.log('mesh num: ', intersected[0].object.cubeNum);
    // if(!intersected[0].object.ttt && turn === 1) {
    if(intersected[0].object.ttt === undefined && turn === 1) {


      intersected[0].object.material.color = userColor1;
      intersected[0].object.ttt = 'user1';

      // intersected[0].object.material.color = color;
      // intersected[0].object.ttt = (turn === -1) ? 'user1' : 'user2';

      // only change turn if selection legit
      turn *= -1;
      checkForTTT();

      if(!gameOver) {
        // after a short pause, execute user code.
        window.setTimeout(function(){
          userTurn();
        }, 500);
      }
    }
  }
}


function userTurn(){

  var gridStatus = getGridStatus();

  var selection = yourTurn(gridStatus);

  getGridStatus();

  if(selection >= 0 && selection <= 26){
    for(var i = 0; i < _demo.collisions.length; i++){
      var cube = _demo.collisions[i];
      if(cube.cubeNum === selection && cube.ttt === undefined) {
          console.log('computer selected cube ' + selection);
          cube.material.color = userColor2;
          cube.ttt = 'user2';
          turn *= -1;
          checkForTTT();
          return;
      }
    }
  } else {
    console.log("selection is not within 0-26");
  }

  // select again.
  userTurn();
}

function getGridStatus() {
  var i,
      gridInfo = [];

  for(i = 0; i < _demo.collisions.length; i++){
     cube = _demo.collisions[i];

     var cubeInfo = {
       num: cube.cubeNum,
       selected: false,
       user: undefined,
     };

     if(!cube.ttt){
       cubeInfo.selected = false;
     } else {
       cubeInfo.selected = true;
       cubeInfo.user = cube.ttt;
     }
     gridInfo.push(cubeInfo);
  }

  return gridInfo;
}



// loop through all the rays and look to see if all of their collisions objects show the same values.
//
//    essentially, a ray will intersect all faces in one particular direction.  3 cubes = 6 faces = 6 intersections
//    if all of the intersections show a 'selection' has take place, it'll check the selection types (ttt property)
function checkForTTT(){

  var i,j,
      collisions,
      ticUser1,
      ticUser2;

  for(i = 0; i < rays.length; i++){
    collisions = rays[i].intersectObjects(_demo.collisions);
    ticUser1 = 0;
    ticUser2 = 0;

    for(j = 0; j < collisions.length; j++){
      if(collisions[j].object.ttt === 'user1'){
        ticUser1++;
      } else if (collisions[j].object.ttt === 'user2'){
        ticUser2++;
      }
    }

    if(ticUser1 === collisions.length){
      console.log("Tic Tac Toe - User 1");
      $('#winner').append("Tic Tac Toe - User 1 (red) is Winner!");
      alert("Tic Tac Toe - User 1 (red) is Winner!");

      gameOver = true;
    }

    if (ticUser2 === collisions.length){
      console.log("Tic Tac Toe - User 2 (black) - Winner");
      $('#winner').append("Tic Tac Toe - User 2 (black) - Winner");
      gameOver = true;
    }

  }

}

// show/hide the arrows.  these represent the Ray placement
function toggleArrows () {

  var i,
      vis;

  for(i = 0; i < _demo.arrows.length; i++){
    _demo.arrows[i].cone.visible = (_demo.arrows[i].cone.visible) ? false : true;
    _demo.arrows[i].line.visible = (_demo.arrows[i].line.visible) ? false : true;
  }
}
