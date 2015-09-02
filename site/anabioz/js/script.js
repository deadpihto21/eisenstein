$( function() {
	$('.input-id').on('focus', function(){
		$("input[name='name']").attr('disabled', true); 
	});
	$('.input-id').on('focusout', function(){
		$("input[name='name']").attr('disabled', false); 
	});
	$('.input-name').on('focus', function(){
		$("input[name='id']").attr('disabled', true); 
	});
	$('.input-name').on('focusout', function(){
		$("input[name='id']").attr('disabled', false); 
	});

  	$('.form-anabioz').submit(function(e) {
		e.preventDefault();
		var id = $('.input-id').val();
		var name = $('.input-name').val();
		if(id === '') {
			$('.single-freeze').html('Введите номер пассажира!')
		} else ajaxNumber(id);
	});
  $('.all-freezes').on('click', function(e) {
	e.preventDefault();
	var vars = $(this).serialize();
    $.ajax({
      type: 'POST',
      url: 'js/anabioz-base.json',
			data: vars,
			dataType: 'json',
			success: function(msg) {
				var table = '<table><thead><tr><td>Id</td><td>Имя</td></tr></thead>';
				for(var i = 0; i < 6; i++) {
					table = table + '<tr><td><a href="#" class="single-link">' + i + '</a></td><td>' + msg[i]['name'] + '</td></tr>';
				}
				table = table + '</table>';
				$('.names').html(table);

				$('.single-link').on('click', function(e){
					id = parseInt($(this).html());
					e.preventDefault();
					ajaxNumber(id);
				})
			},
			error: function() {
				alert('Ошибка')
			}
		});
	});
	function ajaxNumber(id) {
		var vars = $(this).serialize();
		if(id !== '') {
		    $.ajax({
		     	type: 'POST',
		      	url: 'js/anabioz-base.json',
				data: vars,
				dataType: 'json',
				success: function(msg) {
					if(msg[id]) {
						var single = '<table>';
						single = single + '<tr><td>Порядковый номер</td><td>' + id + '</td></tr>';						
						single = single + '<tr><td>Имя</td><td>' + msg[id]['name'] + '</td></tr>';
						single = single + '<tr><td>Возраст</td><td>' + msg[id]['age'] + '</td></tr>';
						single = single + '<tr><td>Пол</td><td>' + msg[id]['sex'] + '</td></tr>';
						single = single + '<tr><td>Профессия</td><td>' + msg[id]['bsn'] + '</td></tr>';
						single = single + '<tr><td>Личный код</td><td>' + msg[id]['code'] + '</td></tr>';
						single = single + '<tr><td>Примечания</td><td>' + msg[id]['note'] + '</td></tr>';																		
						single = single + '</table>';
						$('.single-freeze').html(single);
					} else {
						$('.single-freeze').html('Такого номера нет в базе!');
					}
				},
				error: function() {
					alert('Ошибка')
				}
			});
		}	
	}
});