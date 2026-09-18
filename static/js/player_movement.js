export function handle_player_controls(scene, delta) {
    const dt = delta/1000;

    let targetX = 0;
    let targetY = 0;

    const isMoving = (targetX !== 0 || targetY !== 0);
    const bobSpeed = isMoving ? 0.02 : 0.008;
    const bobAmount = isMoving ? 0.08 : 0.03;

    scene.bobTimer += delta * bobSpeed;

    const bob = Math.sin(scene.bobTimer) * bobAmount;

    scene.player.setScale(
        scene.baseScaleX - bob,
        scene.baseScaleY + bob
    );

    if (scene.cursors.left.isDown) targetX = -1;
    if (scene.cursors.right.isDown) targetX = 1;
    if (scene.cursors.up.isDown) targetY = -1;
    if (scene.cursors.down.isDown) targetY = 1;

    scene.inputVector.x = Phaser.Math.Linear(
        scene.inputVector.x, targetX, 1 - Math.pow(1 - scene.smoothing * dt, 1)
    );
    scene.inputVector.y = Phaser.Math.Linear(
        scene.inputVector.y, targetY, 1 - Math.pow(1 - scene.smoothing * dt, 1)
    );

    let vec = new Phaser.Math.Vector2(scene.inputVector.x, scene.inputVector.y);
    if (vec.length() > 1) vec.normalize();

    scene.player.setVelocity(vec.x * scene.maxSpeed, vec.y * scene.maxSpeed);

    if (targetX !== 0 || targetY !== 0) {
        if (Math.abs(targetX) > Math.abs(targetY)) {
            scene.player.setTexture('player_left');
            scene.player.setFlipX(targetX > 0); // true = mirrored = facing right
        } else {
            scene.player.setTexture(targetY < 0 ? 'player_up' : 'player_down');
            scene.player.setFlipX(false); // reset mirroring for up/down sprites
        }
    }
}