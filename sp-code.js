export function spCode() {
  return ` 

// Adjust these two parameters to get a balance between performance and image quality
setMaxIterations(600)  
setStepSize(0.1);

//The current coordinate space
let s = getSpace();
occlusion(.8);


let rotX= input(20);
let rotY= input(20);

rotateX(6*length(s)+0.4*cos(s.x*0.5)+0.2*sin(time*0.4));  //change with time
rotateX(6*length(s)+0.4*sin(s.y*0.5)+0.2*cos(time*0.4));



//color shader 
let offsetX = input(3460, 0, 4000);
let offsetY = input(3590, 0, 4000);
let offsetZ = input(1032, 0, 4000);
function fbm(p) {
  return vec3(
  fractalNoise(p+offsetX),
  fractalNoise(p+offsetY),
  fractalNoise(p+offsetZ),
  )
}

//construct self-similarity explicitly of color shader
let t = time*0.001
let ss = 0.2*vec3(s.x, s.y, 0)+t
let nn = fbm(fbm(fbm(fbm(ss)/2))*sin(time/10))*0.8+0.5   
color(length(s)+nn*1.2)



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
line(vec3(0), vec3(0, -1.5, 0), .006)

  `;
}
