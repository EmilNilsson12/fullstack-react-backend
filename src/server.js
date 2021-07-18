import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const app = express();

app.use(bodyParser.json());

const withDB = async (operations, res) => {
	try {
		const client = await MongoClient.connect(
			'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
			{
				useNewUrlParser: true,
			}
		);
		const db = client.db('Fullstack-react');

		await operations(db);
		client.close();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
};

app.get('/api/articles/:name', (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name;
		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });
		if (!articleInfo) throw 'Article does not exist';

		return res.status(200).json(articleInfo);
	}, res);
});

app.post('/api/articles/:name/upvote', (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name;

		// Find
		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		if (!articleInfo) throw 'Article does not exist';

		// Update
		await db
			.collection('articles')
			.updateOne(
				{ name: articleName },
				{ $set: { upvotes: articleInfo.upvotes + 1 } }
			);

		// Find after update
		const updatedArticleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		return res.status(200).json(updatedArticleInfo);
	}, res);
});

app.post('/api/articles/:name/add-comment', (req, res) => {
	withDB(async (db) => {
		const articleName = req.params.name;

		// Find
		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		if (!articleInfo) throw 'Article does not exist';

		// Update
		await db
			.collection('articles')
			.updateOne(
				{ name: articleName },
				{ $set: { comments: articleInfo.comments.concat(req.body) } }
			);

		// Find after update
		const updatedArticleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		return res.status(200).send(updatedArticleInfo);
	}, res);
});

app.get('/hello', (req, res) => {
	return res.send('Hello');
});

app.get('/hello/:name', (req, res) => {
	return res.send('Hello ' + req.params.name);
});

app.post('/hello', (req, res) => {
	return res.send(`Hello ${req.body.name}`);
});

app.listen(8000, () => console.log('Listening on port 8000'));
