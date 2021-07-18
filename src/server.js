import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';

const articlesInfo = {
	'learn-react': {
		upvotes: 0,
		comments: [],
	},
	'learn-node': {
		upvotes: 0,
		comments: [],
	},
	'my-thoughts-on-resumes': {
		upvotes: 0,
		comments: [],
	},
};

const app = express();

app.use(bodyParser.json());

app.get('/api/articles/:name', async (req, res) => {
	const articleName = req.params.name;
	try {
		const client = await MongoClient.connect(
			'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
			{
				useNewUrlParser: true,
			}
		);
		const db = client.db('Fullstack-react');

		const articleInfo = await db
			.collection('articles')
			.findOne({ name: articleName });

		if (!articleInfo) throw 'Article does not exist';
		return res
			.status(200)
			.json({ article: articleInfo, msg: 'Sucessfully found article' });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error });
	}
});

app.post('/api/articles/:name/upvote', async (req, res) => {
	const articleName = req.params.name;

	try {
		const client = await MongoClient.connect(
			'mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false',
			{
				useNewUrlParser: true,
			}
		);
		const db = client.db('Fullstack-react');

		// Find before update
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
	} catch (error) {
		console.log(error);
		return res.status(500).json({ error });
	}
});

app.post('/api/articles/:name/add-comment', (req, res) => {
	const articleName = req.params.name;

	articlesInfo[articleName].comments.push(req.body);

	return res.status(200).send(articlesInfo[articleName]);
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
