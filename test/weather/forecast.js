isModule = (typeof module !== "undefined" && module.exports)

if(isModule) {
  require('mocha')
  expect = require('expect.js')
  sinon = require('sinon')
  Weather = require('../../dist/weather')
}

var forecast;

describe("Forecast", function() {
  beforeEach(function() {
    this.server = sinon.fakeServer.create()
    this.server.respondWith(
      'GET',
      'http://openweathermap.org/data/2.1/forecast/city?*',
      [200]
    );

    forecast = new Weather.Forecast({
      list: [
        {
          dt: (new Date("2016-01-22T09:12:21-0800")).getTime() / 1000,
          main: {
            temp_min: 200,
            temp_max: 230
          }
        },
        {
          dt: (new Date("2016-01-23T10:30:52-0800")).getTime() / 1000,
          main: {
            temp_min: 210,
            temp_max: 220
          }
        }
      ]
    });
    
    this.server.respond()
  });

  after(function() {
    this.server.restore()
  })

  it("creates a `Forecast`", function(done) {
    Weather.getForecast('Kansas City', function(forecast) {
      expect(forecast).to.be.a(Weather.Forecast)
      done();
    });
  });

  describe("high", function() {
    it("returns highest temperature in the forecast", function() {
      expect(forecast.high()).to.equal(230);
    });
  });

  describe("low", function() {
    it("returns lowest temperature in the forecast", function() {
      expect(forecast.low()).to.equal(200);
    });
  });

  describe("startAt", function() {
    it("gets the earliest forcasted time", function() {
      expect(forecast.startAt()).to.eql(new Date("2016-01-22T09:12:21-0800"));
    });
  });

  describe("endAt", function(){
    it("gets the latest forcasted time", function() {
      expect(forecast.endAt()).to.eql(new Date("2016-01-23T10:30:52-0800"));
    });
  });

  describe("day", function() {
    it("date", function() {
      expect(forecast.day(new Date(0))).to.be.a(Weather.Forecast)
    });

    it("number", function() {
      expect(forecast.day(new Date("2016-01-23T10:30:52-0800"))).to.be.a(Weather.Forecast)
    });

    it("filters the extended forecast to a single day", function() {
      expect(forecast.day(new Date("2016-01-23T10:30:52-0800")).data).to.eql({
        list: [
          {
            dt: (new Date("2016-01-23T10:30:52-0800")).getTime() / 1000,
            main: {
              temp_min: 210,
              temp_max: 220
            }
          }
        ]
      })
    });
  })

});
