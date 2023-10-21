function clearAccentsDiacritics(length) {
  // Gộp nhiều dấu space thành 1 space
  str = length.replace(/\s+/g, " ");
  // bắt đầu xóa dấu tiếng việt  trong chuỗi
  length = length.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  length = length.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  length = length.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  length = length.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  length = length.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  length = length.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  length = length.replace(/đ/g, "d");
  length = length.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A");
  length = length.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E");
  length = length.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I");
  length = length.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O");
  length = length.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U");
  length = length.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y");
  length = length.replace(/Đ/g, "D");
  return length;
}

exports.clearAccentsDiacritics = clearAccentsDiacritics;
