<template>
	<div id="app">
		<div id="overlay" :class="{ loaded: !loading }"></div>
		<div v-if="gameOver" style="text-align: center;">
			<h3>GAME OVER!</h3>
			<h3>SCORE: {{ score }} / {{ total }}</h3>
			<h4  v-if="score/total<0.4">Not too great</h4>
			<h4  v-else-if="score/total<0.6">OK</h4>
			<h4  v-else-if="score/total<0.9">Nice!</h4>
			<h4  v-else>Amazing!!</h4>
			<img :src="image" width=200/><br>
			<button class="btn-purple" @click="reset">New Game</button>
		</div>
		<div v-else-if="startScreen" id="start-screen" style="display:flex">
			<div>
			<h4>Select a subject </h4>
			<input type="radio" id="g" name="subject" value="9" v-model="subject">
				<label for="g">General</label>
			<input type="radio" id="b" name="subject" value="10" v-model="subject">
				<label for="b">Books</label>
			<input type="radio" id="h" name="subject" value="23" v-model="subject">
				<label for="h">History</label>
			<input type="radio" id="c" name="subject" value="18" v-model="subject">
				<label for="c">Computers</label>
			<input type="radio" id="a" name="subject" value="27" v-model="subject">
				<label for="a">Animals</label>
			</div><div style="width:20px"></div><div>
			<h4>Select a Difficulty</h4>
			<input type="radio" id="e" name="mode" value="easy" v-model="mode">
			<label for="e">Easy</label>
			<input type="radio" id="m" name="mode" value="medium" v-model="mode">
			<label for="m">Medium</label>
			<input type="radio" id="ha" name="mode" value="hard" v-model="mode">
			<label for="ha">Hard</label>
			</div>
			<button class="btn-purple" @click="startGame">Start</button>
		</div>
		<div v-else>
			<div class="loader">
				<div class="status" v-bind:style="{ width: status }"></div>
			</div>
			<h4 class="question" v-html="question" style="text-align:center"></h4>
			<div class="options">
				<div v-for="(opt, index) in options">
					<i :id="index" :class="{ correct: opt == answer }"></i>
					<button @click="checkAnswer(opt, index)" v-html="opt"></button>
				</div>
			</div>
			<span id="btns" style="display: none;">
				<button v-if="questionNumber < total" @click="nextQuestion">
					NEXT <i class="fa fa-arrow-right"></i>
				</button>
				<button v-else @click="finish">DONE <i class="fa fa-check"></i></button>
			</span>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			question: "",
			answer: "",
			options: "",
			score: 0,
			questionNumber: 1,
			total: 10,
			loading: false,
			startScreen: true,
			gameOver: false,
			subject: "",
			mode: "",
			guessed: false,
			token: ""
		};
	},
	computed: {
		status: function () {
			return (this.questionNumber / this.total) * 100 + "%";
		},
		image: function(){
			if(this.score/this.total<0.4){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Sad_Face_Emoji_grande.png?v=1571606037"
			}else if(this.score/this.total<0.6){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Neutral_Face_Emoji_grande.png?v=1571606037"
			}else if(this.score/this.total<0.9){
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Slightly_Smiling_Face_Emoji_87fdae9b-b2af-4619-a37f-e484c5e2e7a4_large.png?v=1571606036"
			}else{
				return "https://cdn.shopify.com/s/files/1/1061/1924/products/Happy_Emoji_Icon_5c9b7b25-b215-4457-922d-fef519a08b06_large.png?v=1571606090"
			}
		}
	},
	methods: {
		startGame: function(){
			if(this.mode&&this.subject){
				this.loading=true;
				this.getQuestion();
				this.startScreen = false;
			}
		},
		checkAnswer: function (selected, index) {
			if (!this.guessed) {
				if (this.answer == selected) {
					this.score++;
				} else {
					$("i#" + index).html("x");
				}
				$("i.correct").html("🗸");
				this.guessed = true;
				$("#btns").show();
			}
		},
		nextQuestion: function () {
			this.loading = true;
			this.getQuestion();
			$("#btns").hide();
			$("i").html("");
			this.questionNumber++;
			this.guessed = false;
		},
		finish: function () {
			this.gameOver = true;
		},
		reset: function(){
			this.gameOver= false;
			this.startScreen = true;
			this.guessed= false;
			this.score = 0;
			this.questionNumber = 1;
		},
		getQuestion: function () {
			var reset = this.questionNumber==this.total ? "command=reset&":""
			var self = this;
			//books:10,history:23
			fetch("https://opentdb.com/api.php?" + reset + "amount=1&type=multiple&category="+self.subject+"&difficulty="+ self.mode+"&token="+self.token)
				.then((response) => {
					if (response.ok) {
						return response.json();
					} else {
						alert("Server returned " + response.status + " : " + response.statusText);
					}
				})
				.then((response) => {
					self.question = response.results[0].question;
					self.answer = response.results[0].correct_answer;
					self.options = response.results[0].incorrect_answers;
					self.options.push(response.results[0].correct_answer);
					self.shuffle(self.options);
					self.loading = false;
				});
		},
		shuffle: function (array) {
			for (let i = array.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[array[i], array[j]] = [array[j], array[i]];
			}
		}
	},
	created: function () {
		var self = this;
		fetch("https://opentdb.com/api_token.php?command=request")
			.then((response) => {
				if (response.ok) {
					return response.json();
				} else {
					alert("Server returned " + response.status + " : " + response.statusText);
				}
			})
			.then((response) => {
				self.token = response.token;
			})
	}
};
</script>

<!-- Use preprocessors via the lang attribute! e.g. <style lang="scss"> -->
<style>
#app {
	font-size: 1.5em;
	font-family: Avenir, Helvetica, Arial, sans-serif;
	margin: 30px auto;
	padding: 10px;
	max-width: 600px;
}
#overlay {
	position: absolute;
	top: 0px;
	left: 0px;
	background-color: rgba(0, 0, 0, 0.6);
	width: 100%;
	height: 100%;
	z-index: 2;
}
#overlay:after {
	position: absolute;
	left: 45%;
	top: 45%;
	transform: translateX(-50%), translateY(-50%);
	font-style: normal;
	font-weight: 900;
	color: white;
	font-size: 3em;
	font-family: "Font Awesome 5 Free";
	content: "\f1ce";
	animation: spin 2000ms infinite linear;
}
#overlay.loaded {
	display: none;
}
#start-screen input{
	opacity: 0
}
#start-screen label{
	display:block;
	position:relative;
	background-color: lightgrey;
	padding:5px 20px;
	border-radius:4px;
	margin:0;
}
#start-screen input:checked + label{
	font-weight: bold;
	text-decoration: underline;
}
#start-screen input:checked + label:after{
	position: absolute;
	top:10px;
	left:3px;
	display:inline-block;
	content: "";
	width: 13px;
	height:13px;
	border: 2px solid #c183e2;
	border-radius: 50%;
	background-color: rgba(136, 34, 190, 1);
}
.loader {
	box-sizing: border-box;
	background-color: lightgrey;
	height: 30px;
	border-radius: 5px;
	width: 100%;
	padding: 4px;
}
.loader .status {
	box-sizing: border-box;
	background-color: green;
	border-radius: 3px 0 0 3px;
	height: 100%;
	transition: 1s;
}
.options {
	display: flex;
	flex-wrap: wrap;
}
.options div {
	box-sizing: border-box;
	width: 50%;
	padding: 10px;
	position: relative;
}
.options div button {
	font-size: inherit;
	background: linear-gradient(
		0deg,
		rgba(136, 34, 190, 1) 0%,
		rgba(189, 147, 255, 1) 60%,
		rgba(212, 184, 255, 1) 84%,
		rgba(255, 255, 255, 1) 100%
	);
	color: #4c0066;
	font-weight: bold;
	width: 100%;
	min-height: 100px;
	border-radius: 5px;
	border: none;
}
.options div button:hover {
	background: linear-gradient(
		0deg,
		rgba(136, 34, 190, 1) 0%,
		rgba(189, 147, 255, 1) 82%,
		rgba(212, 184, 255, 1) 100%,
		rgba(255, 255, 255, 1) 100%
	);
}
.options div button:focus {
	outline: none;
	box-shadow: 0 0 15px 5px rgba(212, 184, 255, 1);
}
.options div i:empty {
	display: none;
}
.options div i {
	position: absolute;
	top: 18px;
	right: 18px;
	width: 1.25em;
	height: 1.25em;
	border-radius: 50%;
	font-size: 0.75em;
	text-align: center;
	vertical-align: center;
	background-color: #8a0000;
	color: white;
}
.options div i.correct {
	background-color: green;
}
#btns button, .btn-purple{
	float: right;
	margin: 10px;
	font-size: 1em;
	padding: 4px 6px;
	background-color: white;
	border: 3px solid #4c0066;
	border-radius: 10px;
	color: #4c0066;
	font-weight: bold;
	cursor: pointer;
}
#btns button:hover, .btn-purple:hover {
	background-color: #faebff;
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
