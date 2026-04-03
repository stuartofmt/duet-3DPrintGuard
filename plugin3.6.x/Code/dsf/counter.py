def failure_test(uuid,window,threshold,latest_failure):
	'''
	latest_failure == 1 for failure and 0 for success
	'''
	# initial setup
	if not hasattr(failure_test, "counts"):
		failure_test.counts = {}

	# Add new uuid
	if failure_test.counts.get(uuid) is None:
		failure_test.counts[uuid] = {'failure_count': 0, 'stack': (), 'stack_length':0}

	failure_count = failure_test.counts[uuid]['failure_count']
	stack = failure_test.counts[uuid]['stack']
	stack_length = failure_test.counts[uuid]['stack_length']

	slicer = stack_length // window # integer divide ==>  0 if < window else 1
	
	# update the failure count
	oldest_entry = 0
	if stack_length >= window: 	# Dont grow the stack
		oldest_entry = stack[0]
	else:						# Still filling the stack window
		stack_length += 1
	
	failure_count = failure_count + latest_failure-oldest_entry # latest and oldest may both have been failure

	# Can we finish already?
	if failure_count >= threshold:
		print(failure_test.counts[uuid])
		del failure_test.counts[uuid] # reset
		return True

	stack = (*stack[slicer:], latest_failure) # max # entries == window 
	failure_test.counts[uuid] = {'failure_count': failure_count, 'stack': stack, 'stack_length':stack_length}
	return False

if __name__ == "__main__":    # Test setup
	#failure_test(uuid,window,threshhold,latest_failure)
	import random
	import sys

	for i in range (1,100):
		uuid = '0'
		if failure_test(uuid,10,5,random.randint(0, 1)):
			print(f'uuid {uuid} had a failure at test {i}')
			break

	for i in range (1,300):
		uuid = str(random.randint(1, 3))
		if failure_test(uuid,10,5,random.randint(0, 1)):
			print(f'uuid {uuid} had a failure at test {i}')




