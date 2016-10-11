var canvas = document.getElementById('c');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
var context = canvas.getContext('2d');

class Square{
	constructor(x,y,w){
		this.x = x;
		this.y = y;
		this.w = w;
	}
	update(dt){
		this.x +=60*dt
	}
	render(context){
		context.fillRect(this.x,this.y,this.w,this.w);
	}
}

class Layer{
	constructor(width,height){
		this.canvas = document.createElement('canvas');
		this.canvas.width = width;
		this.canvas.height = height;
		this.context = this.canvas.getContext('2d');
	}
	render(ctx){
		ctx.drawImage(this.canvas,0,0);
	}
	clear(){
		this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
	}
}


class PaintingLayer extends Layer{
	constructor(width,height,x,y){
		super(width,height);
		this._x = x;
		this._y = y;
		this.lastX = x;
		this.lastY = y;
	}
	update(x,y){
		this.x = x;
		this.y = y;
		this.context.beginPath();
		this.context.moveTo(this.lastX,this.lastY);
		this.context.lineTo(this.x,this.y);
		this.context.stroke();
		this.context.closePath();
	}
	get x(){
		return this._x;
	}
	set x(val){
		this.lastX = this.x;
		this._x = val;
	}
	get y(){
		return this._y;
	}
	set y(val){
		this.lastY = this.y;
		this._y = val;
	}

}
class Segment{
	constructor(x,y,length,angle,parent){
		this.x = x;
		this.y = y;
		this.length = length;
		this.angle = angle;
		this.parent = parent;
		this.rate = 0;
	}
	update(dt){
		this.angle += this.rate;
	}
	render(ctx){
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.endX,this.endY);
		ctx.stroke();
		ctx.closePath();
	}
	get endX(){
		return this.x + Math.cos(this.angle) * this.length;
	}
	get endY(){
		return this.y + Math.sin(this.angle) * this.length;
	}
}


var seg = new Segment(canvas.width/2,canvas.height/2,canvas.height/6,0);
var seg2 = new Segment(seg.endX,seg.endY,canvas.height/6,0);
var seg3 = new Segment(seg2.endX,seg2.endY,canvas.height/6,0);
var painting = new PaintingLayer(canvas.width,canvas.height,seg3.endX,seg3.endY);
var Anim = {
	startTime: new Date().getTime(),
	loopNum:0,
	last:new Date().getTime(),
	now:new Date().getTime(),
	dt:0,
	paused: true,
	context: context,
	start: function(){
		this.paused = false;
		this._update();
	},
	pause: function(){
		this.paused = true;
	},
	_update: function(){
		self = this;
		if(this.paused) return;
		this.loopNum++;
		this.now = new Date().getTime();
		this.dt = (this.now - this.last)/1000;
		this.last = this.now;
		self.update(this.dt);
		self.render(this.dt,this.loopNum);

		requestAnimationFrame(function(){
			self._update();
		});
	},
	update: function(){
		seg.update(this.dt);
		seg.rate = document.getElementById('n1').value/3000;
		
		seg2.x = seg.endX;
		seg2.y = seg.endY;
		seg2.update(this.dt);
		seg2.rate = document.getElementById('n2').value/3000;

		seg3.x = seg2.endX;
		seg3.y = seg2.endY;
		seg3.update(this.dt);
		seg3.rate = document.getElementById('n3').value/3000;

		for(var n of ['n1','n2','n3']){
			document.getElementById(n+'val').innerHTML = document.getElementById(n).value;
		}
		painting.update(seg3.endX,seg3.endY);
	},
	render: function(){
		this.context.clearRect(0,0,canvas.width,canvas.height);
		painting.render(this.context);	
		seg.render(this.context);
		seg2.render(this.context);
		seg3.render(this.context);
	}
};
Anim.start();

setInterval(function(){
	$.get('reset').success(function(data){
		if(data > 0) location.reload();
	});
},3000);

document.getElementById('clear').addEventListener('click',function(e){
	seg.angle = 0;
	seg2.angle = 0;
	seg3.angle = 0;
	painting.update(Anim.context);
	painting.clear();
});