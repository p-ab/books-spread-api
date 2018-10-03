const request  = require('supertest'),
		app    = require('../app'),
		should = require('chai').should(),
		assert = require('assert')

describe('homepage', () => {
	it("Welcome message", (done) => {
		request(app).get('/')
			.expect(200)
			.expect(/Welcome to the Spread-API/, done)
	})
})

describe('bookslist', () => {
	it("GET BookList", () => {
		return request(app).get('/bookslist')
			.expect(200)
			.then( response => {
				assert(response.body.title, 'Books List')
			})
	})
})

