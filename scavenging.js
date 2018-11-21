function main() {
	generateTimeTable();
	$('#time-picker')
		.on('input', updateUnitsTable)
		.clockpicker({
			autoclose: true,
			beforeShow: () => $('#time-picker').blur(),
			afterDone: updateUnitsTable
		});

	updateUnitsTable();
	setInterval(updateUnitsTable, 3000);
}

function generateTimeTable() {
	for (unit of units) {
		insertTimeTableRow(unit);
	}
}

function insertTimeTableRow(unit) {
	unitRow = $('<tr>')
		.append(td(unit.name))
		.append($(`<input type="number" id="${unit.id}" name="quantity" value="" min="0" max="25000">`)
			.on('input', updateUnitsTable)
			.on('mousewheel', e => {})
		);
	
	for (let levelId = 0; levelId < collectingFactors.length; levelId++) {
		unitRow = unitRow.append(td(0).attr('id', unitsCellId(unit.id, levelId)));
	}
		
	$('#unitsForTime')
		.find('tbody').append(unitRow);		
}

function td(text) {
	return $('<td>').text(text);
}

function clearUnits() {
	for (unit of units) {
		$(`#${unit.id}`).val("");
	}
	updateUnitsTable();
}

function updateUnitsTable() {
	fillUnitsForTimeTable(getCollectingTime());
}

function fillUnitsForTimeTable(collectingTime) {
	for (unit of units) {
		unitAmounts = [];
		for (collectingFactor of collectingFactors) {
			unitAmounts.push(getUnitAmountForTime(unit, collectingFactor, collectingTime));
		}
		updateUnitAmounts(unit, unitAmounts);
	}
}

function getUnitAmountForTime(unit, collectingFactor, collectingTime) {
	material = getMaterialAmountForTime(materialTimes, collectingTime);
	return getUnitAmount(unit, collectingFactor, material);
}

function getMaterialAmountForTime(materialTimes, collectingTime) {
	lowerTime = materialTimes[0].time;
	upperTime = materialTimes.slice(-1)[0].time;
	
	if (collectingTime < lowerTime || collectingTime >= upperTime) {
		return 0;
	}
	
	surroundingTimeRows = findSurroundingTimeRows(materialTimes, collectingTime);
	return interpolateMaterialAmount(surroundingTimeRows[0], surroundingTimeRows[1], collectingTime);
}

function findSurroundingTimeRows(materialTimes, time) {
	for (row of materialTimes) {
		if (time >= row.time) {
			lowerRow = row;
		} else {
			return [lowerRow, row];
		}
	}
}

function interpolateMaterialAmount(lowerPoint, upperPoint, time) {
	lowerTime = lowerPoint.time;
	upperTime = upperPoint.time;
	
	scaleFactor = (time - lowerTime) / (upperTime - lowerTime);

	lowerMaterial = lowerPoint.material;
	upperMaterial = upperPoint.material;
	
	return lowerMaterial + scaleFactor * (upperMaterial - lowerMaterial);
}

function getUnitAmount(unit, collectingFactor, material) {
	collectingResources = material / collectingFactor;
	collectingResources -= getAlreadyAllocatedResources();
	return Math.max(0, Math.floor(collectingResources / unit.capacity));
}

function getAlreadyAllocatedResources() {
	let resources = 0;
	for (let unit of units) {
		let allocatedUnits = parseInt($(`#${unit.id}`).val());
		if (!isNaN(allocatedUnits)) {
			resources += allocatedUnits * unit.capacity;
		}
	}
	return resources;
}

function updateUnitAmounts(unit, amounts) {
	for (let [levelId, amount] of amounts.entries()) {
		$(`#${unitsCellId(unit.id, levelId)}`).text(amount);
	}
}

function unitsCellId(unitId, levelId) {
	return unitId + levelId;
}

function getCollectingTime() {
	targetTime = getTargetTime();
	if (targetTime == undefined) {
		return 0;
	}
	collectingTime = targetTime - getCurrentTime();
	if (collectingTime <= 0) {
		collectingTime += DAY;
	}
	return collectingTime;
}

function getTargetTime() {
	textTime = $('#time-picker').val();
	if (!TARGET_TIME_PATTERN.test(textTime)) {
		return undefined;
	}
	return parseTime(textTime);
}

function parseTime(textTime) {
	hourMinute = textTime.split(':');
	hours = parseInt(hourMinute[0]);
	minutes = parseInt(hourMinute[1]);
	return 60 * hours + minutes;	
}

function getCurrentTime() {
	currentDate = new Date();
	return currentDate.getHours() * 60
		 + currentDate.getMinutes()
		 + currentDate.getSeconds() / 60;
}

main();