// Name the values we'll define per each vertex.
// First, specify the vertex positions -- the three point locations of an imaginary triangle.
// Next, supply vectors that point away from the triangle face.  They should match up with the points in
// the above list.  Normal vectors are needed so the graphics engine can know if the shape is pointed at
// light or not, and color it accordingly.  lastly, put each point somewhere in texture space too.
// Index into our vertices to connect them into a whole triangle.
// A position, normal, and texture coord fully describes one "vertex".  What's the "i"th vertex?  Simply the combined data
// you get if you look up index "i" of those lists above -- a position, normal vector, and tex coord together.  Lastly we
// told it how to connect vertex entries into triangles.  Every three indices in "this.indices" traces out one triangle.

window.Triangle = window.classes.Triangle =
    class Triangle extends Shape {
        // The simplest possible Shape – one triangle.  It has 3 vertices, each
        // having their own 3D position, normal vector, and texture-space coordinate.
        constructor() {
            super("positions", "normals");
            this.positions = [
                Vec.of(0, 0, 0), Vec.of(1, 0, 0), Vec.of(0, 1, 0),
            ];
            this.normals = [
                Vec.of(0, 0, 1), Vec.of(0, 0, 1), Vec.of(0, 0, 1),
            ];
            this.indices = [0, 1, 2,];
        }
    };

window.Cube = window.classes.Cube =
    class Cube extends Shape {
        // Here's a complete, working example of a Shape subclass.  It is a blueprint for a cube.
        constructor() {
            super("positions", "normals");
            this.positions.push(
                ...Vec.cast(
                    [-1, -1, -1], [1, -1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, -1], [-1, 1, -1], [1, 1, 1], [-1, 1, 1],
                    [-1, -1, -1], [-1, -1, 1], [-1, 1, -1], [-1, 1, 1], [1, -1, 1], [1, -1, -1], [1, 1, 1], [1, 1, -1],
                    [-1, -1, 1], [1, -1, 1], [-1, 1, 1], [1, 1, 1], [1, -1, -1], [-1, -1, -1], [1, 1, -1], [-1, 1, -1]
                ));
            this.normals.push(
                ...Vec.cast([0, -1, 0], [0, -1, 0], [0, -1, 0], [0, -1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0], [0, 1, 0],
                    [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [-1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0], [1, 0, 0],
                    [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, 1], [0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]));
            this.indices.push(0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 8, 9, 10, 9, 11, 10, 12, 13,
                14, 13, 15, 14, 16, 17, 18, 17, 19, 18, 20, 21, 22, 21, 23, 22);
        }
    };

window.Square_Outline = window.classes.Square_Outline =
    class Square_Outline extends Shape {
        constructor() {
            super("positions", "colors"); // Name the values we'll define per each vertex.
            const white_c = Color.of(1, 1, 1, 1);

            // HINT: When a set of lines is used in graphics, you should think of the list
            // entries as broken down into pairs; each pair of vertices will be drawn as a
            // line segment.
            this.positions.push(
                ...Vec.cast(
                    [0, 0, 0], [1, 0, 0],
                    [1, 1, 0], [0, 1, 0],
                    [1, 0, 0], [1, 1, 0],
                    [0, 1, 0], [0, 0, 0],
                )
            );

            this.colors = [white_c, white_c, white_c, white_c, white_c, white_c, white_c, white_c];
            this.indexed = false;
        }
    };

window.Demo_Scene = window.classes.Demo_Scene =
    class Demo_Scene extends Scene_Component {
        constructor(context, control_box) {
            // The scene begins by requesting the camera, shapes, and materials it will need.

            super(context, control_box);
            // First, include a secondary Scene that provides movement controls:
            if (!context.globals.has_controls)
                context.register_scene_component(new Movement_Controls(context, control_box.parentElement.insertCell()));

            const r = context.width / context.height;
            context.globals.graphics_state.camera_transform = Mat4.translation([0, 0, -10]);

            // Locate the camera here (inverted matrix).
            context.globals.graphics_state.projection_transform = Mat4.perspective(Math.PI / 4, r, .1, 1000);

            const shapes = {
                // At the beginning of our program, load one of each of these shape
                // definitions onto the GPU.  NOTE:  Only do this ONCE per shape
                // design.  Once you've told the GPU what the design of a cube is,
                // it would be redundant to tell it again.  You should just re-use
                // the one called "box" more than once in display() to draw
                // multiple cubes.  Don't define more than one blueprint for the
                // same thing here.
                'triangle': new Triangle(),
                'box': new Cube(),
                'outline': new Square_Outline(),
            };
            this.submit_shapes(context, shapes);

            // Make some Material objects available to you:
            this.clay = context.get_instance(Phong_Shader).material(Color.of(.9, .5, .9, 1), {
                ambient: .4,
                diffusivity: .4
            });
            this.white = context.get_instance(Basic_Shader).material();
            this.plastic = this.clay.override({specularity: .6});
            this.lights = [new Light(Vec.of(0, 5, 5, 1), Color.of(1, .4, 1, 1), 100000)];
        }


        make_control_panel() {
        }

        draw_triangle(graphics_state, model_transform) {
            const white = Color.of(1, 1, 1, 1);
            this.shapes.triangle.draw(graphics_state, model_transform, this.plastic.override({color: white}));
        }

        draw_cube(graphics_state, model_transform) {
            const red = Color.of(100 / 100, 28 / 100, 31 / 100, 1);
            this.shapes.box.draw(graphics_state, model_transform, this.plastic.override({color: red}));
        }

        draw_outline(graphics_state, model_transform) {
            this.shapes.outline.draw(graphics_state, model_transform, this.white, "LINES");
        }

        display(graphics_state) {
            // Initiate
            graphics_state.lights = this.lights;

            let model_transform = Mat4.identity();
            // Draw the outline
            this.draw_outline(graphics_state, model_transform);

            // TODO: Translate
            // let T = Mat4.translation([2, 0, 0]);
            //
            // let T = Mat.of(
            //     [1, 0, 0, 3],
            //     [0, 1, 0, 0],
            //     [0, 0, 1, 0],
            //     [0, 0, 0, 1],
            // );
            // model_transform = model_transform.times(T);
            // // console.log(model_transform);
            // this.draw_outline(graphics_state, model_transform);

            // TODO: Scaling
            // let S = Mat4.scale([2, 3, 1,]);
            // let S = Mat.of(
            //     [2, 0, 0, 0],
            //     [0, 1, 0, 0],
            //     [0, 0, 1, 0],
            //     [0, 0, 0, 1],
            // );
            // model_transform = model_transform.times(S);
            // console.log(model_transform);
            // this.draw_outline(graphics_state, model_transform);

            // TODO: Rotate
            // let R = Mat4.rotation(Math.PI/4, Vec.of(0,0,1));
            // let theta = Math.PI/4;
            // let R = Mat.of(
            //     [Math.cos(theta), -Math.sin(theta), 0, 0],
            //     [Math.sin(theta), Math.cos(theta), 0, 0],
            //     [0, 0, 1, 0],
            //     [0, 0, 0, 1],
            // );
            // model_transform = model_transform.times(R);
            // this.draw_outline(graphics_state, model_transform);

            // TODO: Shear
            // let Shear = Mat.of(
            //     [1, 0.5, 0, 0],
            //     [0, 1, 0, 0],
            //     [0, 0, 1, 0],
            //     [0, 0, 0, 1],
            // );
            // model_transform = model_transform.times(R).times(S);
            // this.draw_outline(graphics_state, model_transform);

            // TODO: Transformations

            // TODO: Animation
            let t = this.t = graphics_state.animation_time / 1000;
            console.log(t);
            let T = Mat4.translation([0.5, 0, 0]);
            let R = Mat4.rotation(Math.PI/20 * t, Vec.of(0,0,1));
            for (let i = 0; i < 10; i++) {
                model_transform = model_transform.times(T).times(R);
                // let current_transform = Mat4.translation([-5,-5,0]).times(model_transform);
                this.draw_outline(graphics_state, model_transform);
            }

            t = this.t = graphics_state.animation_time / 1000;
            console.log(t);
            // TODO: (Practice) Use reflection, scaling, translation, and rotation together to draw a tree.
        }
    };