export const filterCalendar = (comp, category) => {
	if (category === 'all') {
		return comp;
	}
	let vevents = comp.getAllSubcomponents('vevent');
	vevents.forEach(vevent => {
		if (eventType(vevent) !== category) {
			comp.removeSubcomponent(vevent);
		}
	});

	// deduplicate if important-date
	if (category === 'important-date') {
		let vevents = comp.getAllSubcomponents('vevent');
		for (let i = 0; i < vevents.length; i++) {
			for (let j = 0; j < vevents.length; j++) {
				if (i === j) {
					continue;
				}
				if (
					vevents[i].getFirstPropertyValue('summary') === vevents[j].getFirstPropertyValue('summary') &&
					vevents[i].getFirstPropertyValue('dtstart').toString() === vevents[j].getFirstPropertyValue('dtstart').toString() &&
					vevents[i].getFirstPropertyValue('dtend').toString() === vevents[j].getFirstPropertyValue('dtend').toString() &&
					vevents[i].getFirstPropertyValue('description').trim() === ""				
				) {
					comp.removeSubcomponent(vevents[i]);
					vevents = comp.getAllSubcomponents('vevent');
					i = -1;
					break;
				}
			}
		}
	}

	// add exam seating to PAC finals
	vevents = comp.getAllSubcomponents('vevent');
	vevents.forEach(vevent => {
		const matching = vevent.getFirstPropertyValue('description').trim().match(/Go to the PAC \(Physical Activities Complex\)Enter at the (?<entrance>[A-Z]*) entranceGo (?<direction>[a-z]*) all the way to (?<level>.*?)When allowed by proctors\, enter and find seat (?<seat>.*?)$/);
		if (!matching) {
			return;
		}
		vevent.updatePropertyWithValue('location', `PAC ${matching.groups.seat} (${matching.groups.entrance}, go ${matching.groups.direction}, ${matching.groups.level})`);
	});	

	
	return comp;
}



const eventType = (vevent) => {
	if (vevent.getFirstPropertyValue('dtstart').isDate) {
		return 'important-date';
	}
	let summary = vevent.getFirstPropertyValue('summary');
	if (summary.includes('(LEC)')) {
		return 'lecture';
	}
	if (summary.includes('(TUT)')) {
		return 'tutorial';
	}
	if (summary.includes('(LAB)') || summary.includes('(CLN)')) {
		return 'lab';
	}
	if (summary.includes('(TST)') || summary.toLowerCase().trim().endsWith('final')) {
		return 'exam';
	}
	if (vevent.getFirstPropertyValue('dtstart').toString() === vevent.getFirstPropertyValue('dtend').toString()) {
		return 'tip';
	}
	if (summary.toLowerCase().replace(/\d+$/g, '').trim().endsWith('quiz')) {
		return 'quiz';
	}
	return 'other';
}