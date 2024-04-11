const eventsDragAndDrop = [
	"drop",
	"dragstart",
	"drag",
	"dragover",
	"dragleave",
	"dragenter",
];
const eventsTouch = ["touchstart", "touchend", "touchmove"];
const eventsMouse = ["mousedown", "mouseup", "mousemove", "click"];

export function dataURLtoFile(dataurl, filename) {
	const arr = dataurl.split(",");
	const mime = arr[0].match(/:(.*?);/)[1];
	const bstr = atob(arr[arr.length - 1]);
	let n = bstr.length;
	const u8arr = new Uint8Array(n);
	while (n--) {
		u8arr[n] = bstr.charCodeAt(n);
	}
	return new File([u8arr], filename, { type: mime });
}
// obtiene las cordenadas del evento respecto al navegador, esto funciona con eventos mouse, touch y drag
export function getClientPosition(e) {
	if (eventsDragAndDrop.includes(e.type)) {
		return { x: e.clientX, y: e.clientY };
	}
	if (eventsTouch.includes(e.type)) {
		return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
	}
	if (eventsMouse.includes(e.type)) {
		return { x: e.clientX, y: e.clientY };
	}
}

// posiciona un punto dentro de los limites y guardando el margen que le des
export function limitPosition(limit, position, margin) {
	const newPosition = { ...position };
	if (position.x < 0) newPosition.x = 0;
	if (position.x > limit.x - margin.x) newPosition.x = limit.x - margin.x;

	if (position.y < 0) newPosition.y = 0;
	if (position.y > limit.y - margin.y) newPosition.y = limit.y - margin.y;

	return newPosition;
}
// convierte el array de clipPath en un string de css para clip-path
export function createClipPath(arr, width, height) {
	const newArr = arr.map(pos => ({ x: pos.x / width, y: pos.y / height }));
	// console.log(newArr);
	return (
		newArr.reduce(
			(acc, cur, key) =>
				acc +
				` ${Math.floor(cur.x * 100)}% ${Math.floor(cur.y * 100)}%${
					key === arr.length - 1 ? "" : ","
				}`,
			"polygon("
		) + ")"
	);
}
// guarda el aspecto ratio de la vieja posicion pero con el nuevo tamaño
export function saveAspectRatio(oldSize, newSize) {
	const diferenceX = Math.abs(oldSize.width - newSize.width);
	const diferenceY = Math.abs(oldSize.height - newSize.height);
	if (diferenceX > diferenceY) {
		const relation = oldSize.width / oldSize.height;
		newSize.height = Math.floor(newSize.width / relation);
	} else {
		const relation = oldSize.height / oldSize.width;
		newSize.width = Math.floor(newSize.height / relation);
	}

	return newSize;
}

// guarda el aspecto ratio de la vieja posicion pero con el nuevo tamaño
export function saveAspectRatioCrop(newP, oldP) {
	/*
	1: saber cual es la diferencia entre el punto actual y el centro
	2: saber cual es la diferencia ente el nuevo punto y el centro
	3: saber el valor absoluto de las diferencias
	4: decidir que diferencia absoluta es mayor si alto o ancho
	5: comparar los valores absolutos, para saber si disminuye o aumenta
	6: obtener el signo de la difenrecia nueva de la coordenada opuesta
	7: multiplicar el signo con la diferencia absoluta y luego sumarla a la antigua diferencia
	8: agregarle la diferencia al punto centro
	9: retornar
	*/

	const absNew = { x: Math.abs(newP.x), y: Math.abs(newP.y) };
	const absOld = { x: Math.abs(oldP.x), y: Math.abs(oldP.y) };
	// console.log(absNew);
	const diference = { x: absNew.x - absOld.x, y: absNew.y - absOld.y };

	if (Math.abs(diference.x) >= Math.abs(diference.y)) {
		const percetaje = absNew.x / absOld.x;
		const refactorP = { x: oldP.x * percetaje, y: oldP.y * percetaje };
		return refactorP;
	} else {
		const percetaje = absNew.y / absOld.y;
		const refactorP = { x: oldP.x * percetaje, y: oldP.y * percetaje };
		return refactorP;
	}
}

// hace los respectivos ajustes a las propiedades actes de actualizar
export function PreprocessProperties(newProperties, oldProperties) {
	// comparar el nuevo con el viejo para ver si hay diferencias reales

	if (newProperties.lockAspect) {
		newProperties = saveAspectRatio(oldProperties, newProperties);
	}
	// guardar es porcentaje del crop respecto al tamaño
	if (
		oldProperties.width !== newProperties.width ||
		oldProperties.height !== newProperties.height
	) {
		const perWidth = newProperties.width / oldProperties.width;
		const perHeight = newProperties.height / oldProperties.height;
		newProperties.clipPath = newProperties.clipPath.map(pos => ({
			x: pos.x * perWidth,
			y: pos.y * perHeight,
		}));
	}
	return newProperties;
}

// convierte el objeto de filters en una cadena de css con para filtros
export function processFilters(filters) {
	return `grayscale(${filters.grises}) blur(${filters.desenfoque}px) sepia(${filters.sepia}) saturate(${filters.saturacion}) contrast(${filters.contraste}) hue-rotate(${filters.hue}deg) brightness(${filters.brillo})`;
}
// compara los dos objetos y devuelte las propiedades que son diferentes
export function DiferenceProperties(oldProperties, newProperties) {
	const changes = { id: oldProperties.id };
	for (const [key, value] of Object.entries(oldProperties)) {
		if (key === "clipPath") {
			for (const index in value) {
				if (
					value[index].x !== newProperties[key][index].x ||
					value[index].y !== newProperties[key][index].y
				) {
					changes[key] = value;
				}
			}
		} else {
			if (oldProperties[key] !== newProperties[key]) changes[key] = value;
		}
	}

	return changes;
}
// filtro al exportar imagenes
export function filter(node) {
	const exclusionClasses = ["remove-me", "secret-div"];
	return !exclusionClasses.some(classname =>
		node.classList?.contains(classname)
	);
}
// control inputs number
export function verifidValid(min, max, value) {
	const number = parseFloat(value);
	if (isNaN(number))
		return { success: false, menssage: "tiene que ser un numero" };
	if (max !== undefined)
		if (number > max)
			return { success: false, menssage: `tiene que ser menor a ${max}` };
	if (min !== undefined)
		if (number < min)
			return { success: false, menssage: `tiene que ser mayor a ${min}` };
	return { success: true, menssage: `si es` };
}

// cambia URL por base64 con ayuda del servidor
export async function GetBase64(url) {
	const formData = new FormData();
	formData.append("url", url);
	const result = await fetch(
		"https://demos.booksandbooksdigital.com.co/simuladores-2023/Backend-Simuladores/public/api/dataFile",
		{
			method: "POST",
			body: formData,
		}
	).then(res => res.json());
	return result.data;
}
