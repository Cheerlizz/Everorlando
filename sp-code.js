export function spCode() {
  return ` 

// Adjust these two parameters to get a balance between performance and image quality
setMaxIterations(700)  
setStepSize(0.1);
rotateY(time*0.2);
//The current coordinate space
let s = getSpace();
occlusion(-10);


let rotX= input(20);
let rotY= input();

rotateX(6*length(s)+cos(s.x*0.8));  //change with time
rotateX(6*length(s)+0.2*sin(s.y*0.5)+cos(time*0.5));



//color shader 
let offsetX = input(243, 0, 4000);
let offsetY = input(1150, 0, 4000);
let offsetZ = input(243, 0, 4000);
function fbm(p) {
  return vec3(
  0,
  fractalNoise(p+offsetY),
  fractalNoise(p+offsetZ),
  )
}

//construct self-similarity explicitly of color shader
let t = time*0.001
let ss = 0.3*vec3(s.x, s.y, 0)+t
let nn = fbm(fbm(fbm(fbm(ss)/2))*sin(time/8))*0.9+0.75;  
color(length(s)+nn*1.5);



// Use sound frequencies to distort the coordinate space, thus deforming the object
let offX = input();
let offY= input();
displace(vec3(offX,offY,offX))


// Create orgainc object with the distance to the nearest of N points distributed over a sphere.
let petal = input(0.4);
sphere(petal);

let numPoints = input();
let fuse = input();
let distro = sphericalDistribution(s, numPoints);   //the collection of numPoints points in the 3D space
expand(distro.w * ((-2)*abs(sin(fuse))-0.2));



// The base 
reset();
let n = noise(s*.1);
displace((1-s.x)*.0, 0, n*1.2)
metal(0.1);
shine(0.2);
color(vec3(0.3,0.7,0.5));
line(vec3(0), vec3(0, -1, 0), .003)

  `;
}
