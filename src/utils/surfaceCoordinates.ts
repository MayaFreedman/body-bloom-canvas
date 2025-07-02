
import * as THREE from 'three';

export interface SurfaceCoordinate {
  bodyPart: string;
  u: number; // UV coordinate U (0-1)
  v: number; // UV coordinate V (0-1)
  triangleIndex: number; // Which triangle on the mesh
  barycentricCoords: THREE.Vector3; // Barycentric coordinates within the triangle
}

export interface SurfaceDrawingPoint {
  id: string;
  surfaceCoord: SurfaceCoordinate;
  color: string;
  size: number;
}

// Calculate surface coordinates from a world intersection point
export const calculateSurfaceCoordinates = (
  intersect: THREE.Intersection,
  mesh: THREE.Mesh
): SurfaceCoordinate | null => {
  if (!intersect.face || !intersect.uv || !mesh.userData.bodyPart) {
    return null;
  }

  // Get barycentric coordinates from the intersection
  const barycentricCoords = new THREE.Vector3();
  if (intersect.face && intersect.object instanceof THREE.Mesh && intersect.object.geometry instanceof THREE.BufferGeometry) {
    // Use the face index to get triangle information
    const faceIndex = intersect.faceIndex || 0;
    
    // Calculate barycentric coordinates based on intersection point
    // This is a simplified approach - in a full implementation you'd calculate
    // the exact barycentric coordinates within the triangle
    barycentricCoords.set(0.33, 0.33, 0.34); // Placeholder - should be calculated
  }

  return {
    bodyPart: mesh.userData.bodyPart,
    u: intersect.uv.x,
    v: intersect.uv.y,
    triangleIndex: intersect.faceIndex || 0,
    barycentricCoords
  };
};

// Convert surface coordinates back to world position
export const surfaceCoordinatesToWorldPosition = (
  surfaceCoord: SurfaceCoordinate,
  mesh: THREE.Mesh
): THREE.Vector3 | null => {
  if (!mesh.geometry || !(mesh.geometry instanceof THREE.BufferGeometry)) {
    return null;
  }

  const geometry = mesh.geometry;
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;

  if (!position || !uv) {
    return null;
  }

  // Get the triangle vertices
  const triangleIndex = surfaceCoord.triangleIndex;
  const indexArray = geometry.index?.array;
  
  if (!indexArray || triangleIndex * 3 + 2 >= indexArray.length) {
    return null;
  }

  // Get vertex indices for the triangle
  const a = indexArray[triangleIndex * 3];
  const b = indexArray[triangleIndex * 3 + 1];
  const c = indexArray[triangleIndex * 3 + 2];

  // Get vertex positions
  const vA = new THREE.Vector3().fromBufferAttribute(position, a);
  const vB = new THREE.Vector3().fromBufferAttribute(position, b);
  const vC = new THREE.Vector3().fromBufferAttribute(position, c);

  // Interpolate position using barycentric coordinates
  const result = new THREE.Vector3();
  result.addScaledVector(vA, surfaceCoord.barycentricCoords.x);
  result.addScaledVector(vB, surfaceCoord.barycentricCoords.y);
  result.addScaledVector(vC, surfaceCoord.barycentricCoords.z);

  // Transform to world space
  mesh.localToWorld(result);

  return result;
};

// Find mesh by body part name in a model group
export const findMeshByBodyPart = (modelGroup: THREE.Group, bodyPart: string): THREE.Mesh | null => {
  let foundMesh: THREE.Mesh | null = null;
  
  modelGroup.traverse((child) => {
    if (child instanceof THREE.Mesh && child.userData.bodyPart === bodyPart) {
      foundMesh = child;
    }
  });
  
  return foundMesh;
};
