import path from 'path';
import express from 'express';
import * as api from './api.js';
import { filterCalendar } from './filters.js';

const app = express();

app.use('/', express.static(path.join(process.cwd(), '/static')));

const names = {
	'lecture': 'Lectures',
	'tutorial': 'Tutorials',
	'lab': 'Labs',
	'exam': 'Exams',
	'important-date': 'Important Dates',
	'quiz': 'Quizzes',
	'tip': 'Tips',
	'other': 'Other'
}
const urlRegex = `https://portalapi2.uwaterloo.ca/(.*?).ics`;

app.get('/filter/:category', async (req, res) => {
	let category = req.params.category;
	let url = req.query.url;
	if (!url) {
		res.send('No URL provided');
		return;
	}
	if (!url.match(urlRegex)) {
		res.send('Please provide a valid URL');
		return;
	}
	let text;
	try {
		text = await api.fetchCalendar(url);
	} catch (e) {
		res.send('Error fetching calendar: ' + e);
		return;
	}
	const comp = api.parseCalendar(text);
	const filtered = filterCalendar(comp, category);
	if (category !== 'all') {
		filtered.updatePropertyWithValue('x-wr-calname', `${names[category]} - ${filtered.getFirstPropertyValue('x-wr-calname')}`);
	}
	const ics = api.generateIcs(filtered);
	res.setHeader('Content-Type', 'text/calendar');
	//res.setHeader('Content-Type', 'text/plain');
	res.send(ics);
});

app.listen(process.env.PORT || 3000);
