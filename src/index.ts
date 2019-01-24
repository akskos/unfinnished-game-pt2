import _ from 'lodash';

const component = () => {
    const p = document.createElement('p');
    p.innerHTML = 'Hello world ' + _.concat([1,2], [3,4,5]);
    return p;
}

document.body.appendChild(component());