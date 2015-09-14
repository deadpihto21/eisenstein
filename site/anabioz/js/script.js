$( function() {

	var person_max_count = 6;

  	$('.form-anabioz').submit(function(e) {
 		e.preventDefault();
		var vars = $(this).serialize();
	    $.ajax({
	      type: 'POST',
	      url: 'js/anabioz-base.json',
				data: vars,
				dataType: 'json',
				success: function(msg) {
					var table = '<table><thead><tr><td>Порядковый номер</td><td>Имя</td></tr></thead>';
					for(var i = 0; i < person_max_count; i++) {
						table = table + '<tr><td><a href="#" class="single-link">' + i + '</a></td><td>' + msg[i]['name'] + '</td></tr>';
					}
					table = table + '</table>';
					$('.single-freeze').html(table);

					$('.single-link').on('click', function(e){
						id = parseInt($(this).html());
						e.preventDefault();
						ajaxNumber(id, 'id');
					})
				},
				error: function() {
					alert('Ошибка')
				}
			}); 		
	});

	$('.all-freezes').on('click', function(e) {
		e.preventDefault();
		var search_code = $(this).attr('data-search');
		var search_key = $(this).parent().find('input').val();

		if(search_key !== '') ajaxNumber(search_key, search_code);			
	});

	$('.all-freezes-sex').on('click', function(e) {
		e.preventDefault();	
		var search_key = $('input:radio[name=sex]:checked').val();
		if(search_key == 'male') {
			search_key = 'Мужской';
		} else {
			search_key = 'Женский'
		}	
		var search_code = 'sex';
 		ajaxNumber(search_key, search_code);			
	});	

	function ajaxNumber(search_key, search_code) {
		var vars = $('.form-anabioz').serialize();
		$.ajax({
		  	type: 'POST',
		   	url: 'js/anabioz-base.json',
			data: vars,
			dataType: 'json',
			success: function(msg) {
				if(search_code == 'id') {
					if(msg[search_key]) {
						var single = '<table>';
						single = single + '<tr><td><b>Порядковый номер</b></td><td>' + search_key + '</td></tr>';						
						single = single + '<tr><td>Имя</td><td>' + msg[search_key]['name'] + '</td></tr>';
						single = single + '<tr><td>Возраст</td><td>' + msg[search_key]['age'] + '</td></tr>';
						single = single + '<tr><td>Пол</td><td>' + msg[search_key]['sex'] + '</td></tr>';
						single = single + '<tr><td>Профессия</td><td>' + msg[search_key]['bsn'] + '</td></tr>';
						single = single + '<tr><td>Личный код</td><td>' + msg[search_key]['code'] + '</td></tr>';
						single = single + '<tr><td>Примечания</td><td>' + msg[search_key]['note'] + '</td></tr>';																		
						single = single + '</table>';
						$('.single-freeze').html(single);
					} else {
						$('.single-freeze').html('Такого номера нет в базе!');
					}
				}
				if((search_code == 'name') || (search_code == 'age') || (search_code == 'code')) {
					for(var i = 0; i < person_max_count; i++) {
						if(msg[i][search_code] == search_key) {
							var single = '<table>';
							single = single + '<tr><td>Порядковый номер</td><td>' + i + '</td></tr>';
							if(search_code == 'name') {
								single = single + '<tr><td><b>Имя</b></td><td>' + msg[i]['name'] + '</td></tr>';
							} else single = single + '<tr><td>Имя</td><td>' + msg[i]['name'] + '</td></tr>';
							if(search_code == 'age') {
								single = single + '<tr><td><b>Возраст</b></td><td>' + msg[i]['age'] + '</td></tr>';
							} else single = single + '<tr><td>Возраст</td><td>' + msg[i]['age'] + '</td></tr>';

							single = single + '<tr><td>Пол</td><td>' + msg[i]['sex'] + '</td></tr>';
							single = single + '<tr><td>Профессия</td><td>' + msg[i]['bsn'] + '</td></tr>';
							if(search_code == 'code') {
								single = single + '<tr><td><b>Личный код</b></td><td>' + msg[i]['code'] + '</td></tr>';
							} else single = single + '<tr><td>Личный код</td><td>' + msg[i]['code'] + '</td></tr>';							
							
							single = single + '<tr><td>Примечания</td><td>' + msg[i]['note'] + '</td></tr>';																		
							single = single + '</table>';
							$('.single-freeze').html(single);
							break;						
						} else {
							switch (search_code) {
								case 'name':
									$('.single-freeze').html('Человека с таким именем нет в базе!');
									break;
								case 'age':
									$('.single-freeze').html('Человека с таким возрастом нет в базе!');
									break;
								case 'code':
									$('.single-freeze').html('Человека с личным кодом нет в базе!');
									break;																		
							}
						}
					}
				}
				if((search_code == 'sex') || (search_code == 'bsn'))  {
					var search_wrap = '';
					switch (search_code) {
						case 'sex':
							search_wrap = 'Пол';
							break;
						case 'bsn':
							search_wrap = 'Профессия';
							break;																	
						}					
					var table = '<table><thead><tr><td>' + search_wrap + '</td><td>Имя</td></tr></thead>';
					var flag = false;
					for(var i = 0; i < person_max_count; i++) {
						if(msg[i][search_code] == search_key) {
							table = table + '<tr><td>' + search_key + '</td><td>' + msg[i]['name'] + '</td></tr>';
							flag = true;
						}
					}
					table = table + '</table>';
					if((search_code == 'bsn') && (flag == false)) table = 'Никого с такой профессией не обнаружено!'
					$('.single-freeze').html(table);					

					$('.single-link').on('click', function(e){
						id = parseInt($(this).html());
						e.preventDefault();
						ajaxNumber(id, 'id');
					})					
				}

			},
			error: function() {
				alert('Ошибка')
			}
		});
	}
});