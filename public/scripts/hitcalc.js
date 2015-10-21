
var AMTFee = 0.1;
var CDFee = 0.2;
var totalfee = 1 + AMTFee + CDFee;


var m = 0.35;
var b = 0.5;



function costPerInterview (time, hits, targetID) {
	var hitsPerHour = hits/time;
	var dollarPerHit = m * hitsPerHour + b;
	var dollarPerHitA = Math.round((dollarPerHit * totalfee) * 100) /100;
	var dphString = dollarPerHitA.toString();
	$(targetID).html(dphString);
	console.log(dphString);
};
