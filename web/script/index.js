let current_prof=0;
const max_prof=3
const prof_img = document.getElementById("pfp_img")
function change_prof(x){
    current_prof+=x
    if (current_prof<0){current_prof=max_prof}
    else if (current_prof>max_prof){current_prof=0}
    prof_img.src=`web/img/prof/${current_prof}.jpg`
}