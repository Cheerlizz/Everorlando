export function spCode() {
  return `
  
        let purpleSphere = shape(() => {
  color(1, 0, 1);
  displace(.4, .4, 0);
  sphere(0.2);
});

purpleSphere();
sphere(0.2);
      
      box(vec3(.5));
      
      

  `;
}