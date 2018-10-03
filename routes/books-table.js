var express = require('express');
var router = express.Router();
var GoogleSpreadsheet = require('google-spreadsheet');
var doc = new GoogleSpreadsheet('16SBccDEXRsDzQEyK4E3IsNdBccq08VVpjlbXldwk2Tg');
var sheet;
var creds = require('../configs/client_secret.json');

/* GET books listing. */
router.get('/', (req, res, next) => {
	doc.useServiceAccountAuth(creds, (err) => {

	  doc.getInfo(function(err, info) {
	    sheet = info.worksheets[0];
	    sheet.getRows({ worksheet_id: 1, orderby: 'rate' }, (err, books) => { 
	      let results = {
		  		title: info.title,
		  		creator: info.author.email,
		  		data: []
	      };

	      books.map( item => {
	    	let data = { author: item.author, book: item.book, 
	    		rate: item.rate, year: item.year, emoji: item.emoji };
		    	
		  	results.data.push(data);
	      });

   	      res.status(200).send(results);
		});
	  });
	});
});

/* POST new book */
router.post('/', (req, res, next) => {
	doc.useServiceAccountAuth(creds, (err) => {

		let year = req.body.year ? req.body.year : '----';
	    let Book = {
	    	id: '=ROW()-1',
	    	author: req.body.author,
	    	book: req.body.book, year, rate: req.body.rate,
	    	emoji: '🤔 🤔 🤔'
	    };
	    doc.addRow(1, Book, (err, cb) => {
	    	if (!err) {
	    		res.send({
	    			message: 'Successfully added!', 
	    		    item: { author: cb.author, book: cb.book }
	    		});
	    	}
        });
	});
});

router.put('/:id', (req, res, next) => {
	let id = 1 + parseInt(req.params.id);
	let options = { 'min-row': id, 'max-row': id, 'min-cel': 0, 'max-cel': 5 };

	doc.useServiceAccountAuth(creds, (err) => {

	    doc.getInfo(function(err, info) {
	      sheet = info.worksheets[0];
		  sheet.getCells(options, (err, cells) => {
			let results = [], values = [], result = {};
			cells.map((item, key) => {
				switch(key) {
					case 1:
						if (req.body.book) item.value = req.body.book;
						break;
					case 2:
						if (req.body.author) item.value = req.body.author;
						break;
					case 3:
						if (req.body.rate) item.value = req.body.rate;
						break;
					case 4:
						if (req.body.emoji) item.value = req.body.emoji;
						break;
					case 5:
						if (req.body.year) item.value = req.body.year;
						break;
					default:
						console.log(`ID: ${item.value}`);
				}
				results = [... results, item];
				values = [... values, item.value];
			});

			sheet.bulkUpdateCells(results, (err) => { 
				if (!err) res.send({ values });
			});
		  });
		});
	});
});

module.exports = router;
