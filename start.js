$(document).ready(function () {

    var gameStart = document.getElementById('gameStart');
    var showScore = document.getElementById('showScore');
    var text = document.getElementById('score');
    showScore.className = 'hide';

    const bgm = document.querySelector('#bgm');
    playBGM = bgm.play.bind(bgm);
    const overAudio = document.querySelector('#over');
    playOver = overAudio.play.bind(overAudio);

    //============== public properties============
    var screenWidth = window.innerWidth; // get screen width

    // create background
    var bg;
    var bg_width = 350; //background width
    var bg_height = 600; //background height; 
    var bg_left = (screenWidth - bg_width) / 2;
    var bg_top = 30; // position of background

    // score
    var score = 0;
    var scoreList = [];


    // create a div function for following objects
    function createDiv(width, height, background, left, top, type) {
        var div = document.createElement(type); // create an object by its type

        div.style.width = width + "px";
        div.style.height = height + "px";

        div.style.background = background;
        div.style.backgroundSize = "contain";
        div.style.backgroundRepeat = "no-repeat";


        div.style.position = "absolute";
        div.style.left = left + "px";
        div.style.top = top + "px";

        document.body.appendChild(div);

        return div;
    }




    //============== set user plane ============
    // create user plane
    var plane;

    var plane_w = 60; //plane width
    var plane_h = 60; //plane height
    var plane_left = bg_left + (bg_width - plane_w) / 2;
    var plane_top = bg_top + bg_height - plane_h; // initial position of user plane

    // anaimation timer of user plane
    var plane_anim_time;
    // attack timer of user plane
    var plane_attack_time;

    function heroPlane(left, top) {

        var hero = createDiv(plane_w, plane_h, 'url(https://zhuoxiu.neocities.org/hero1.png)', left, top, 'div'); // create user plane, insert the image


        var Hp = 1; // set one life at start
        var p = this; // use p to save the object

        this.getWidth = function () {
            return parseInt(hero.style.width); // get width
        }
        this.getHeight = function () {
            return parseInt(hero.style.height); //get height
        }

        this.setLeft = function (value) {
            hero.style.left = value + "px"; //get left position
        }
        this.getLeft = function () {
            return parseInt(hero.style.left); // return hero x position; 
        }

        this.setTop = function (value) {
            hero.style.top = value + "px"; //get top position
        }
        this.getTop = function () {
            return parseInt(hero.style.top); // return hero y position;
        }

        // show different conditions of user plane
        this.setBg = function (url) {
            hero.style.background = url;
            hero.style.backgroundSize = "100% 100%";
        }

        // set user plane animation
        this.animation = function () {
            var flies = ["url(https://zhuoxiu.neocities.org/hero1.png)", "url(https://zhuoxiu.neocities.org/hero2.png)"]; // two images show animation
            var index = 0;
            // set animation timer
            plane_anim_time = setInterval(anim_time, 150);

            function anim_time() {
                if (++index > 1) {
                    index = 0;
                }
                p.setBg(flies[index]);
            }
        }



        // set attack function: shoot bullet
        this.attack = function () {
            // set attack timer	
            plane_attack_time = setInterval(attack_time, 300);

            function attack_time() {
                var obj = new bullet(p.getLeft() + plane_w / 3, p.getTop() - 20);
                obj.move();
                bullets.push(obj);
            }
        }


        // control movement of user plane by mouse
        this.move = function () {
            //get initial position of mouse
            var offestX = 0;
            var offestY = 0;
            hero.onmousedown = function (e) {
                //record position of mouse
                offestX = e.offsetX;
                offestY = e.offsetY;
            }
            //start x position
            var startX = bg_left - (plane_w / 6);

            //end x position
            var maxX = startX + bg_width - plane_w + 15;
            document.onmousemove = function (e) {
                // console.log(startX, maxX);
                var x = e.clientX - offestX; //get real-time position of user plane

                if (x >= startX && x <= maxX) { //control the scope
                    hero.style.left = x + "px";
                }
            }
        }

        // user plane boom
        var booms = ["url(https://zhuoxiu.neocities.org/hero_boom_1.png)", "url(https://zhuoxiu.neocities.org/hero_boom_2.png)", "url(https://zhuoxiu.neocities.org/hero_boom_3.png)", "url(https://zhuoxiu.neocities.org/hero_boom_4.png)", "url(https://zhuoxiu.neocities.org/enemy1_boom_4.png)"];
        this.boom = function () {
            clearInterval(plane_anim_time);
            clearInterval(plane_attack_time);
            var index = 0;
            var plane_boom_time = setInterval(boom_time, 100);

            function boom_time() {
                // clear all timer
                if (++index == booms.length) {
                    clearInterval(plane_boom_time);
                    document.body.removeChild(hero);

                } else {
                    p.setBg(booms[index]);
                }
            }


        }
    }

    //============== check hit ============
    // check if two planes get crashed
    function hitCheck(obj1, obj2) {

        // get distance of two objects (absolute value)
        var dis_x = Math.abs((obj1.getLeft() + obj1.getWidth() / 2) - (obj2.getLeft() + obj2.getWidth() / 2));
        var dis_y = Math.abs((obj1.getTop() + obj1.getHeight() / 2) - (obj2.getTop() + obj2.getHeight() / 2));

        // check the distance between the centers of the two divs
        if (dis_x <= obj1.getWidth() / 2 + obj2.getWidth() / 2 &&
            dis_y <= obj1.getHeight() / 2 + obj2.getHeight() / 2) {
            return true; // crashed
        }
        return false; // no crash
    }

    // check when user plane flying
    function plane_time() {
        // start check function
        var plane_check_time = setInterval(fly_time, 100);

        function fly_time() {
            for (var i = 0; i < enemies.length; i++) {
                if (hitCheck(plane, enemies[i])) {
                    // clear user plane timer
                    clearInterval(plane_check_time);
                    clearInterval(plane_attack_time);
                    plane.boom();

                    // clear enemy plane timer
                    clearInterval(create_enemy1_time);
                    clearInterval(create_enemy2_time);
                    clearInterval(create_enemy3_time);

                    // clear all enemy planes
                    for (var j = 0; j < enemies.length; j++) {
                        enemies[j].boom();

                    }
                    enemies = new Array();
                    // clear all bullets
                    for (var k = 0; k < bullets.length; k++) {

                        bullets[k].dead();
                    }
                    bullets = new Array();
                    //audio effect pause
                    bgm.pause();
                    playOver();
                    showEnd(); //show end page           
                }
            }
        }
    }


    //============== set end page ============
    function showEnd() {

        var msg = createDiv(200, 100, 'url(https://zhuoxiu.neocities.org/endback.png)', plane_left - 70, 260, 'div');
        msg.className = 'msg1';

        if (score > 600) {
            msg.innerHTML = '<br/> You got ' + score + ' scores this time. <br/> Congratulations!';
        } else {
            msg.innerHTML = '<br/> You got ' + score + ' scores this time. <br/> You can do better!';
        }
        scoreList[0] = 0;
        scoreList.push(score);

        // var scoreString = JSON.stringify(scoreList);
        localStorage.setItem('score', scoreList);
        var highestScore = document.getElementById('highest');
        for (var i = 0; i < scoreList.length; i++) {
            if (scoreList[i] > scoreList[i - 1]) {
                // console.log(scoreList[i]);
                highestScore.innerHTML = scoreList[i];

            }
        }
        //============== restart ============
        var restartBtn = document.createElement('p'); //('restart');
        restartBtn.className = 'msg1';
        restartBtn.innerHTML = '<br> Restart';
        bg.appendChild(restartBtn);
        restartBtn.onmouseenter = function () {
            this.style.background = '#e6d5b8';
            this.style.color = '#000';
        }
        restartBtn.onmouseleave = function () {
            this.style.background = '#dbdbdb';
            this.style.color = '#34626c';
        }
        restartBtn.addEventListener('click', function () {
            bg.remove();
            msg.remove();
            init();
        });

    }


    // ============== set bullet ===============
    var bullet_w = 18,
        bullet_h = 18;
    var bullets = new Array();


    function bullet(left, top) {

        var bullet = createDiv(bullet_w, bullet_h, "url(https://zhuoxiu.neocities.org/bullet.png)", left, top, "div"); //create bullet
        var bullet_move_time; //set bullet move timer
        var p = this; // use p to save the object

        this.getWidth = function () {
            return parseInt(bullet.style.width); // get width
        }
        this.getHeight = function () {
            return parseInt(bullet.style.height); // get height
        }

        this.setLeft = function (value) {
            bullet.style.left = value; //get left position
        }
        this.getLeft = function () {
            return parseInt(bullet.style.left); // return bullet x position; 
        }

        this.setTop = function (value) {
            bullet.style.top = value; //get top position
        }
        this.getTop = function () {
            return parseInt(bullet.style.top); // return bullet y position; 
        }

        // bullet move
        this.move = function () {
            // after generation, bullets fly automatically
            bullet_move_time = setInterval(move_time, 20);

            function move_time() {
                bullet.style.top = (p.getTop() - 10) + "px";

            }

        }

        // bullet disappear
        this.dead = function () {
            clearInterval(bullet_move_time);
            document.body.removeChild(bullet);
        }

    }

    // check when bullets flying
    var bullet_check_time;

    function check_time() {

        for (var i = 0; i < bullets.length; i++) {
            // near the boarder, the bullets disappear automatically
            if (bullets[i].getTop() < bg_top + 35) {

                bullets[i].dead(); // remove bullets in array
                bullets.splice(i--, 1); // remove objs one by one

            } else {
                // check if user plane crashes enemy plane
                for (var j = 0; j < enemies.length; j++) {

                    // check if enemy plane comes out of page
                    if (enemies[j].getTop() >= bg_top + bg_height - enemies[j].getHeight()) {

                        // delete enemy planes  
                        enemies[j].dead();

                        enemies.splice(j--, 1); // remove objs one by one
                    } else if (hitCheck(bullets[i], enemies[j])) { // if bullets hit enemy plane
                        bullets[i].dead(); // destory bullets  

                        bullets.splice(i--, 1); // remove objs one by one

                        if (enemies[j].getHp() == 0) {
                            enemies[j].boom(enemy_boom[0]);

                            enemies.splice(j--, 1); // remove objs one by one
                        }
                        break;
                    }
                }
            }
        }
    }

    // ============== set enemy planes ===============

    var enemies = new Array();

    var enemy_boom = [["url(https://zhuoxiu.neocities.org/enemy1_boom_1.png)", "url(https://zhuoxiu.neocities.org/enemy1_boom_2.png)",
				   "url(https://zhuoxiu.neocities.org/enemy1_boom_3.png)", "url(https://zhuoxiu.neocities.org/enemy1_boom_4.png)"],
				 ["url(https://zhuoxiu.neocities.org/enemy2_boom_1.png)", "url(https://zhuoxiu.neocities.org/enemy2_boom_2.png)",
				   "url(https://zhuoxiu.neocities.org/enemy2_boom_3.png)", "url(https://zhuoxiu.neocities.org/enemy1_boom_4.png)"],
				  ["url(https://zhuoxiu.neocities.org/enemy3_boom_1.png)", "url(https://zhuoxiu.neocities.org/enemy3_boom_2.png)",
				   "url(https://zhuoxiu.neocities.org/enemy3_boom_3.png)", "url(https://zhuoxiu.neocities.org/enemy1_boom_4.png)"],
				 ]; // images of boom enemies

    // set enemy generation timer
    var create_enemy1_time;
    var create_enemy2_time;
    var create_enemy3_time;



    function enemy(width, height, url, left, top, hp, type) {

        var enemy = createDiv(width, height, url, left, top, "div");
        var hp = hp; // health point
        var type = type;

        this.getHp = function () {
            hp--;
            return hp;
        }
        this.getWidth = function () {
            return parseInt(enemy.style.width);
        }
        this.getHeight = function () {
            return parseInt(enemy.style.height);
        }
        this.getLeft = function () {
            return parseInt(enemy.style.left);
        }
        this.getTop = function () {
            return parseInt(enemy.style.top);
        }

        var p = this; // use p to save the object

        var enemy_move_time; // set a timer to control enemy planes' movement

        var enemy_boom_time; // set a timer to control enemy planes' boom

        // enemy move
        this.move = function () {
            enemy_move_time = setInterval(move_time, 100);

            function move_time() {
                enemy.style.top = p.getTop() + 5 + "px"; // enemy appear from top
            }
        }

        // enemy boom
        this.boom = function () {

            score = changeScore(type);

            function changeScore(type) {
                score += type * 10;
                return score;
            }
            //============== show score============
            text.innerHTML = score;

            //console.log(score);

            enemy_boom_time = setInterval(boom_time, 100);
            var pics;
            if (type == 1) {
                pics = enemy_boom[0];
            } else if (type == 2) {
                pics = enemy_boom[1];
            } else if (type == 3) {
                pics = enemy_boom[2];
            }
            var index = 0;

            function boom_time() {
                if (++index == pics.length) {
                    p.dead(); // enemy planes disappear after boom
                } else {
                    enemy.style.background = pics[index];
                    enemy.style.backgroundSize = "100% 100%";
                }

            }

        }
        // enemy disappear
        this.dead = function () {

            clearInterval(enemy_move_time);
            clearInterval(enemy_boom_time);
            document.body.removeChild(enemy);


        }
    }


    // create enemy1
    function createEnemy1(second) {
        // start generation timer of enemy plane1
        create_enemy1_time = setInterval(createEnemy1_time, second);

        // create enemy plane1
        function createEnemy1_time() {
            var left = parseInt(Math.random() * (bg_width - 60)) + bg_left;

            var obj = new enemy(50, 50, "url(https://zhuoxiu.neocities.org/enemy01.png)", left, bg_top, 1, 1);

            obj.move();
            enemies.push(obj);
        }
    }

    // create enemy2
    function createEnemy2(second) {
        // start generation timer of enemy plane2
        create_enemy2_time = setInterval(createEnemy2_time, second);

        // create enemy plane2
        function createEnemy2_time() {
            var left = parseInt(Math.random() * (bg_width - 80)) + bg_left;

            var obj = new enemy(60, 60, "url(https://zhuoxiu.neocities.org/enemy02.png)", left, bg_top, 3, 2);

            obj.move();
            enemies.push(obj);
        }
    }

    // create enemy3
    function createEnemy3(second) {
        // start generation timer of enemy plane3
        create_enemy3_time = setInterval(createEnemy3_time, second);

        // create enemy plane3
        function createEnemy3_time() {
            var left = parseInt(Math.random() * (bg_width - 100)) + bg_left;

            var obj = new enemy(80, 80, "url(https://zhuoxiu.neocities.org/enemy03.png)", left, bg_top, 6, 3);

            obj.move();
            enemies.push(obj);
        }
    }



    //============== init function ============
    function init() {
        gameStart.style.display = 'block';
        showScore.style.display = 'none';
        score = 0;

    }


    //============== main function ============
    function main1() {
        playBGM(); //play background music
        bg = createDiv(bg_width, bg_height, "url(https://zhuoxiu.neocities.org/background01.png)", bg_left, bg_top); // create a background
        plane = new heroPlane(plane_left, plane_top); // create a user plane

        plane.animation();
        plane.move();
        plane.attack();

        bullet_check_time = setInterval(check_time, 50);

        createEnemy1(1000);
        createEnemy2(6000);
        createEnemy3(15000);

        plane_time();

    }

    function main2() {
        playBGM(); //play background music
        bg = createDiv(bg_width, bg_height, "url(https://zhuoxiu.neocities.org/background02.png)", bg_left, bg_top); // create a background
        plane = new heroPlane(plane_left, plane_top); // create a user plane

        plane.animation();
        plane.move();
        plane.attack();

        bullet_check_time = setInterval(check_time, 50);

        createEnemy1(500);
        createEnemy2(2000);
        createEnemy3(10000);

        plane_time();

    }

    function main3() {
        playBGM(); //play background music
        bg = createDiv(bg_width, bg_height, "url(https://zhuoxiu.neocities.org/background03.png)", bg_left, bg_top); // create a background
        plane = new heroPlane(plane_left, plane_top); // create a user plane

        plane.animation();
        plane.move();
        plane.attack();

        bullet_check_time = setInterval(check_time, 50);

        createEnemy1(100);
        createEnemy2(600);
        createEnemy3(8000);

        plane_time();

    }

    //============== easy level start ============
    $('.btn-a').click(function () {
        gameStart.style.display = "none"; //hide start page
        showScore.style.display = 'block'; //show score
        main1(); //call main function

    })

    //============== mid level start ============
    $('.btn-b').click(function () {
        gameStart.style.display = "none"; //hide start page
        showScore.style.display = 'block'; //show score
        main2(); //call main function

    })

    //============== hard level start ============
    $('.btn-c').click(function () {
        gameStart.style.display = "none"; //hide start page
        showScore.style.display = 'block'; //show score
        main3(); //call main function

    })




})
