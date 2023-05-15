const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("canvas-container").appendChild(renderer.domElement);
let rotateMeshes = false;
const rotationButton = document.getElementById("rotationButton");
let wireframeMeshes = false;

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
material.receiveShadow = true;
material.castShadow = true;

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
camera.position.z = 5;
camera.position.y = 3;

console.log('Follow me on Twitter! https://twitter.com/AndrewASink')
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Initialize TransformControls
let transformControls;

window.addEventListener('resize', function () {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});

function animate() {
    requestAnimationFrame(animate);

    if (rotateMeshes) {
        cube.rotation.y += 0.005;

        scene.traverse(function (child) {
            if (child.name === 'userMesh') {
                child.rotation.y += 0.005;
            }
        });
    }

    renderer.render(scene, camera);
}

animate();

document.getElementById('uploadButton').addEventListener('click', function () {
    document.getElementById('fileInput').click();
});

document.getElementById('fileInput').addEventListener('change', function () {
    const file = this.files[0];
    const reader = new FileReader();
    reader.addEventListener('load', function (event) {
        const loader = new THREE.STLLoader();
        const geometry = loader.parse(event.target.result);
        geometry.rotateX(-Math.PI / 2);

        const bbox = new THREE.Box3().setFromObject(new THREE.Mesh(geometry));
        const bboxcenter = bbox.getCenter(new THREE.Vector3());
        geometry.translate(-bboxcenter.x, -bboxcenter.y, -bboxcenter.z);

        const material = new THREE.MeshNormalMaterial({ side: THREE.DoubleSide });
        if (wireframeMeshes) {
            material.wireframe = true
        }
        const mesh = new THREE.Mesh(geometry, material);
        mesh.name = 'userMesh';

        // Remove previous models from the scene
        const previousUserMesh = scene.getObjectByName('userMesh');


        if (transformControls && transformControls.object) {
            transformControls.detach(transformControls.object);
        }


        if (previousUserMesh) {
            scene.remove(previousUserMesh);
        }

        scene.add(mesh);

        scene.remove(cube);

        const box = new THREE.Box3().setFromObject(mesh);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const distance = Math.max(size.x, size.y, size.z);

        camera.position.set(center.x, center.y + distance, center.z + distance);

        controls.target.set(center.x, center.y, center.z);
        controls.update();

    });
    reader.readAsArrayBuffer(file);
});

document.getElementById('wireframeButton').addEventListener('click', function () {
    wireframeMeshes = !wireframeMeshes;
    if (wireframeMeshes) {
        wireframeButton.textContent = "Wireframe On";
    } else {
        wireframeButton.textContent = "Wireframe Off";
    }
    scene.traverse(function (child) {
        if (child instanceof THREE.Mesh) {
            child.material.wireframe = !child.material.wireframe;
        }
    });
});


// Add event listener to the Rotation Controls button
document.getElementById('rotationControlButton').addEventListener('click', function () {
    // Check if the TransformControls instance exists
    if (!transformControls) {
        // If not, create a new instance and add it to the scene
        transformControls = new THREE.TransformControls(camera, renderer.domElement);
        transformControls.setMode('rotate'); // Set the mode to rotate
        transformControls.addEventListener('dragging-changed', function (event) {
            controls.enabled = !event.value;
        });
        scene.add(transformControls);
    }

    // Find the user uploaded mesh or the default cube
    let targetMesh = scene.getObjectByName('userMesh') || cube;

    // If the TransformControls is already attached to a mesh, detach it
    if (transformControls.object) {
        transformControls.detach();
    } else {
        // Attach the TransformControls to the target mesh
        transformControls.attach(targetMesh);
    }
});

rotationButton.addEventListener("click", function () {
    rotateMeshes = !rotateMeshes;
    if (rotateMeshes) {
        rotationButton.textContent = "Rotation Off";
    } else {
        rotationButton.textContent = "Rotation On";
    }
});