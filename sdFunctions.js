//import { glslSDF } from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';
import {glslSDF} from 'https://unpkg.com/shader-park-core/dist/shader-park-core.esm.js';

export function sdOctahedron = glslSDF(`
 //https://iquilezles.org/articles/distfunctions/
float sdOctahedron( vec3 p, float s){
  p = abs(p);
  float m = p.x+p.y+p.z-s;
  vec3 q;
       if( 3.0*p.x < m ) q = p.xyz;
  else if( 3.0*p.y < m ) q = p.yzx;
  else if( 3.0*p.z < m ) q = p.zxy;
  else return m*0.57735027;
    
  float k = clamp(0.5*(q.z-q.y+s),0.0,s); 
  return length(vec3(q.x,q.y-s+k,q.z-k)); 
}`);

// export default sdSphere = glslSDF(`
//   //https://www.shadertoy.com/view/7tVXRt
// float sdCutHollowSphere( vec3 p, float r, float h, float t )
// {
//   // sampling independent computations (only depend on shape)
//   float w = sqrt(r*r-h*h);
  
//   // sampling dependant computations
//   vec2 q = vec2( length(p.xz), p.y );
//   return ((h*q.x<w*q.y) ? length(q-vec2(w,h)) : 
//                           abs(length(q)-r) ) - t;
// }
// `);

// add more signed distance functions as needed