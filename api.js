import fs from 'fs';
import NodeCache from 'node-cache';
import ICAL from 'ical.js';


const cacheControl = new NodeCache({ stdTTL: 300, checkperiod: 60 });


export const fetchCalendar = async (url) => {
	/*if (!url) {
		return testCalendar();
	}*/
	let cached = cacheControl.get(url);
	if (cached) {
		return cached;
	}
	let response = await fetch(url);
	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}
	let text = await response.text();
	cacheControl.set(url, text);
	return text;
}
export const testCalendar = () => {
	let text = fs.readFileSync('test.ics', 'utf8');
	return text;
}

export const parseCalendar = (text) => {
	let jcalData = ICAL.parse(text);
	let comp = new ICAL.Component(jcalData);
	return comp;
}
export const generateIcs = (comp) => {
	return comp.toString();
}