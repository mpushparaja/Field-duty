import { IEmployee, IDuty } from "./Interfaces";


export function _fetchActivities(): Promise<[]> {
  return fetch('http://54.255.64.175:3700/api/activity/list', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock',
    }
  })
    .then((resp) => resp.json())
    .then((results) => {
      return results.activities;
    })
    .catch((error) => console.error(error));
}

export function _fetchEmployees(): Promise<[]> {
  return fetch('http://54.255.64.175:3700/api/employee/list', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock',
    }
  })
    .then((resp) => resp.json())
    .then((results) => {
      return results.employees;
    })
    .catch((error) => console.error(error));
}

export function _findEmployee(id: string | undefined): Promise<IEmployee> {
  return fetch('http://54.255.64.175:3700/api/employee/find?id=' + id, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock',
    }
  })
  .then((resp) => resp.json())
  .then((json) => {
    return json.employee;
  })
  .catch((error) => console.error(error));
}

export function _addActivity(type: string, latitude: any, longitude: any, duty: IDuty | undefined, employee: IEmployee | undefined, challenge_issued: Boolean, challenge_verified: Boolean): Promise<void | Date> {
  return fetch('http://54.255.64.175:3700/api/activity/add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock',
    },
    body: JSON.stringify({
      type: type,
      latitude: latitude,
      longitude: longitude,
      duty_id: duty?.id,
      employee_id: employee?.id,
      biometric_url: "",
      biometric_challenge_issued: challenge_issued,
      biometric_challenge_verified: challenge_verified
    }),
  })
  .then((resp) => resp.json())
  .then((json) => {
    return new Date(json.activity.createDate);
  })
  .catch((error) => console.error(error));
}

export function _addDuty() {
  return fetch('http://54.255.64.175:3700/api/duty/add', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock',
    },
    body: JSON.stringify({
    }),
  })
    .then((resp) => resp.json())
    .then((json) => {
      return json.duty;
    })
    .catch((error) => console.error(error));
}

export function _addDriver(firstName: string, lastName: string) {
  return  fetch('http://54.255.64.175:3700/api/employee/add', { 
    method: 'POST', 
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'mock', 
    },
    body: JSON.stringify({
      "firstname" : firstName,
      "lastname" : lastName,
    }),
  })
  .then((resp) => resp.json())
  .then((json) => { 
    return json;
  })
  .catch((error) => console.error(error));
}