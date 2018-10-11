var request = require('request');
var cheerio = require('cheerio')
var app = require('express')();

const hostname = '127.0.0.1';
const port = 3000;

app.get('/', function(req, res) {
  request('https://www.dapurumami.com/resep?show=96', function(error, response, html){
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var result = []
      $('.item-recipe--template').each(function(i, element){
        var title = $(this).find('figcaption').text()
        var kalori = $(this).find('.avatar-text').text();
        var kandungan = $(this).find('.avatar-img').find('img').attr('src')
        var thumbnail = $(this).find('figure').find('img').attr('src')
        if (kandungan == 'https://www.dapurumami.com/assets/img/icon-cal-1.png'){
          kandungan = 'Kalori'
        } else if (kandungan == 'https://www.dapurumami.com/assets/img/icon-cal-2.png') {
          kandungan = 'Protein'
        } else if (kandungan == 'https://www.dapurumami.com/assets/img/icon-cal-3.png') {
          kandungan = 'Karbo'
        } else if (kandungan == 'https://www.dapurumami.com/assets/img/icon-cal-4.png') {
          kandungan = 'Lemak'
        } else {
          kandungan = 'Serat'
        }

        var metadata = {
          "index": i + 1,
          "title": title,
          "kalori": kalori,
          "kandungan_terbanyak": kandungan,
          "thumbnail": encodeURI(thumbnail)
        }

        result.push(metadata)
      })
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  })
})

app.get('/detail', function(req, res) {
  request('https://www.dapurumami.com/resep/bakso-goreng-tenggiri-ala-sajiku-tNcOP', function(error, response, html){
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(html);
      var result = []
      var recipeInfo = $('.recipe-head-info .info-left')
      var recipeDetail = $('.recipe-detail-body')
      var recipeIngredients = $('.recipe-ingredients')
      var calories = recipeDetail.find('.recipe-detail-info').find('.calories')

      var all_info = {}
      recipeInfo.find('p').each(function(i, element){
        if (i == 1){
          all_info['waktu'] = $(this).text()
        }
        if (i == 3){
          all_info['porsi'] = $(this).text()
        }
      })
      
      var all_calories = {}
      calories.find('.item').each(function(i, element){
        var icon = $(this).find('.icon').find('img').attr('src')
        var kandungan_cal = $(this).text()
        if (icon == 'assets/img/icon-cal-1.png'){
          icon = 'kalori'
        } else if (icon == 'assets/img/icon-cal-2.png') {
          icon = 'protein'
        } else if (icon == 'assets/img/icon-cal-3.png') {
          icon = 'karbo'
        } else if (icon == 'assets/img/icon-cal-4.png') {
          icon = 'lemak'
        } else {
          icon = 'serat'
        }

        all_calories[icon] = kandungan_cal
      })

      var all_bahan = {}
      recipeIngredients.find('.ingredients-content').find('p').each(function(i, element){
        var bahan = $(this).text()

        all_bahan[i+1] = bahan
      })

      var all_step = {}
      recipeIngredients.find('.how-to').find('.how-step').each(function(i, element){
        var step = $(this).find('p').text()

        all_step[i+1] = step
      })

      var rating = recipeDetail.find('.rating-sum').text()
      var excerpt = recipeDetail.find('.recipe-detail-info').find('p').text()

      var metadata = {
        "rating": rating,
        "excerpt": excerpt,
        "info": all_info,
        "kandungan": all_calories,
        "bahan": all_bahan,
        "cara": all_step
      }

      result.push(metadata)
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(result);
  })
})

app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
