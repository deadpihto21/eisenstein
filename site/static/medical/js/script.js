$( function() {

	var person_max_count = 100;

	$('.form-med').submit(function(e) {
		e.preventDefault();		
	});

	$('button.treatment').on('click', function(e) {
		e.preventDefault();
		var vars = $('.form-med').serialize();
		var vk = $("input[name='vk']").val();
		var gm = $("input[name='gm']").val();
		var kanzi = $("input[name='kanzi']").val();
		var allcame = $("input[name='allcame']").val();
		if(!vk) vk = '0000000';
		if(!gm) gm = '0000000';
		if(!kanzi) kanzi = '0000000';
		if(!allcame) allcame = '0000000';

		var code = vk + '-' + gm + '-' + kanzi + '-' + allcame;

		$.ajax({
		  	type: 'GET',
		   	url: 'medical/js/medical_diagnosis.json',
			data: vars,
			dataType: 'json',
			success: function(msg) {
				if(msg[code]) {
					$('.medical-data').html(msg[code].treatment)
				} else {
					console.log('Неизвестный код');
					$('.medical-data').html('Неизвестный код')
				}
			},
			error: function(msg) {
				$('.medical-data').html('Ошибка чтения данных')
			}				
		});	
	});		

	$('button.on-name').on('click', function(e) {
		e.preventDefault();
		var search_code = $(this).attr('data-search');
		var search_key = $(this).parent().find('input').val();
		if(search_key !== '') ajaxData(search_key, search_code);		
	});

	function ajaxData(search_key, search_code) {
		var vars = $('.form-med').serialize();
		$.ajax({
		  	type: 'GET',
		   	url: 'medical/js/medical_cards.json',
			data: vars,
			dataType: 'json',
			success: function(msg) {
				for(var i = 0; i < person_max_count; i++) {
					if(msg[i][search_code] == search_key) {
						console.log(msg[i]['note'])
						/*$.ajax({
							type: 'GET',
		   					url: msg[i]['note'],
		   					dataType: 'html',
							success: function(med_sard) {
								console.log(med_sard);
							}
						})*/
						$(".medical-data").load('/medical/js/' + msg[i]['note']);
						//$('.medical-data').html(msg[i]['note']);
						break;
					} else {
						switch (search_code) {
							case 'name':
								$('.medical-data').html('Медицинской карты для человека с таким именем нет в базе!');
								break;
							case 'code':
								$('.medical-data').html('Медицинской карты для человека с таким личным кодом нет в базе!');
								break;																		
						}
					}
				}
			},
			error: function() {
				alert('Ошибка')
			}
		});
	}
});