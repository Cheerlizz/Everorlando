/* eslint-disable */

export function spCode() {
  
  
  let size = input(12, 10, 50.0);
  let gyroidSteps = input(.06, 0, .1)
  let s = getSpace();

  let col = vec3(1, 1, 1.5) + normal * .2;
  metal(.2);
  shine(.5)
  col -= length(s);
  color(col);

  s += time *.1;
  let sdf = min(gyroidSteps, sin(s.x * size) + sin(s.y * size) + sin(s.z * size));
  setSDF(sdf)
  intersect();
  sphere(1);  
}